import {
  Devvit,
  StateSetter,
  useAsync,
  useInterval,
  useState,
  useWebView,
} from '@devvit/public-api';
import {
  AllUpcomingMatchSegment,
  PageType,
  PredictionType,
  SingleUpcomingMatchData,
  SingleUpcomingMatchSegment,
} from '../core/types.js';
import { getTimeRemaining } from '../utils/timeRemaining.js';
import { ErrorState } from '../components/Error.js';
import {
  CLR_DUTCH_WHITE,
  CLR_HIGHLIGHT_GREEN,
  CLR_HIGHLIGHT_GREEN_DARK,
  CLR_WINE,
} from '../core/colors.js';
import { getMatchInfoFromRedis, postMatchPageTypeToRedis } from 'src/redis/matches.js';
import { WebviewToBlockMessage, BlocksToWebviewMessage } from '@/shared.js';
import {
  generateAllPredictionsFromRedis,
  getUserPredsFromRedis,
  postUserPredToRedis,
} from 'src/redis/predictions.js';
import { MAPS } from 'src/utils/maps.js';
import { generatePlayerPickRates } from 'src/utils/predictionStats.js';
import { LivePreview, LivePreviewMobile } from 'src/components/LivePreview.js';
import { LoadingState } from 'src/components/Loading.js';

export const UpcomingMatchPage: Devvit.BlockComponent<{
  setPage: StateSetter<string | null>;
}> = (props, context) => {
  const { postId, userId, settings, ui, cache, redis } = context;

  const [predsSubmitted, setPredsSubmitted] = useState<boolean>(false);
  const [userPreds, setUserPreds] = useState<PredictionType | null>(null);
  const [allPreds] = useState<PredictionType[] | null>(async () => {
    const preds = await generateAllPredictionsFromRedis(redis, postId!);
    return preds;
  });

  const playerPickRates = generatePlayerPickRates(allPreds);

  async function updatePostPreview(context: Devvit.Context) {
    const post = await context.reddit.getPostById(postId!);
    const upcomingMatchInfo = JSON.parse(
      (await getMatchInfoFromRedis(redis, postId!)) as string
    ) as AllUpcomingMatchSegment;

    await post.setCustomPostPreview(() => {
      if (context.dimensions?.width! > 400) {
        return <LivePreview upcomingMatchInfo={upcomingMatchInfo} />;
      }
      return <LivePreviewMobile upcomingMatchInfo={upcomingMatchInfo} />;
    });
  }

  const {
    data: matchData,
    loading,
    error,
  } = useAsync(
    async () => {
      if (!postId || !userId) return null;

      const matchInfoStr = await getMatchInfoFromRedis(redis, postId);
      if (!matchInfoStr) return null;
      const { match_page } = JSON.parse(matchInfoStr) as {
        team1: string;
        team2: string;
        match_page: string;
      };

      const VALBOARD_URL = await settings.get('VALBOARD_URL');
      const url = `${VALBOARD_URL}/match/upcoming/single?url=${match_page}`;

      return await cache(
        async () => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              ui.showToast({
                text: 'Error fetching data...',
                appearance: 'neutral',
              });
              throw Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
            const data = (await response.json()) as SingleUpcomingMatchData;

            const newData: SingleUpcomingMatchSegment = {
              team1: data.data.segments[0].team1,
              team2: data.data.segments[0].team2,
              logo1: await context.assets.getURL(
                `teams/${data.data.segments[0].logo1.replace('//owcdn.net/img/', '')}`
              ),
              logo2: await context.assets.getURL(
                `teams/${data.data.segments[0].logo2.replace('//owcdn.net/img/', '')}`
              ),
              team1_short: data.data.segments[0].team1_short,
              team2_short: data.data.segments[0].team2_short,
              players1: data.data.segments[0].players1,
              players2: data.data.segments[0].players2,
              match_series: data.data.segments[0].match_series,
              match_event: data.data.segments[0].match_event,
              event_logo: await context.assets.getURL(
                `teams/${data.data.segments[0].event_logo.replace('//owcdn.net/img/', '')}`
              ),
              match_date: data.data.segments[0].match_date,
              match_time: data.data.segments[0].match_time,
              unix_timestamp: data.data.segments[0].unix_timestamp,
              rounds: data.data.segments[0].rounds,
            };

            return newData;
          } catch (error) {
            console.error(error);
            ui.showToast({
              text: 'Something went wrong...',
              appearance: 'neutral',
            });
            return null;
          }
        },
        {
          key: `upcoming-${postId}`,
          ttl: 300000, // 5 min
        }
      );
    },
    {
      depends: [predsSubmitted],
      async finally(data, error) {
        if (error) {
          console.error('Failed to load data:', error);
        }
        if (data != null) {
          const userPreds = await getUserPredsFromRedis(redis, postId!, userId!);
          if (!userPreds) setUserPreds(null);
          else setUserPreds(JSON.parse(userPreds));
        }
      },
    }
  );

  if (error) return <ErrorState />;
  if (!matchData || loading) return <LoadingState />;

  const { timeLeft, hasTimeLeft } = getTimeRemaining(matchData.unix_timestamp);

  const interval = useInterval(() => {}, 1000);

  if (hasTimeLeft) {
    interval.start();
  } else {
    interval.stop();
    props.setPage(PageType.LIVE);
    postMatchPageTypeToRedis(redis, postId!, PageType.LIVE);
    updatePostPreview(context);
  }

  const { mount, unmount } = useWebView<WebviewToBlockMessage, BlocksToWebviewMessage>({
    onMessage: async (event, { postMessage }) => {
      const data = event as unknown as WebviewToBlockMessage;

      switch (data.type) {
        case 'INIT':
          const userPreds = await getUserPredsFromRedis(redis, postId!, userId!);
          postMessage({
            type: 'INIT_RESPONSE',
            payload: {
              postId: context.postId!,
              matchData: matchData,
              userPreds: userPreds ? JSON.parse(userPreds) : null,
            },
          });
          break;

        case 'SEND_USER_PREDS':
          unmount();
          await postUserPredToRedis(redis, postId!, userId!, data.payload);
          setPredsSubmitted(true);
          break;

        default:
          console.error('Unknown message type', data satisfies never);
          break;
      }
    },
  });

  return (
    <zstack width={'100%'} height={'100%'}>
      <hstack height={100} width={100}>
        {MAPS.map((map) => {
          return (
            <image
              url={`maps/${map}.png`}
              imageHeight={100}
              imageWidth={100}
              height={100}
              width={100}
              resizeMode="cover"
              grow
            />
          );
        })}
      </hstack>
      <vstack width={'100%'} height={'100%'}>
        {context.dimensions?.width! > 400 ? (
          <UpcomingPageTopBar matchData={matchData} />
        ) : (
          <UpcomingPageTopBarMobile matchData={matchData} />
        )}

        <spacer size="small" />

        {context.dimensions?.width! > 400 ? (
          <UpcomingMatchInfo matchData={matchData} timeLeft={timeLeft} userPreds={userPreds} />
        ) : (
          <UpcomingMatchInfoMobile
            matchData={matchData}
            timeLeft={timeLeft}
            userPreds={userPreds}
          />
        )}

        <spacer size="small" />

        {/* <hstack width={100} height={2} backgroundColor="red" alignment="center middle">
          <hstack width={57} height={2}></hstack>
          <hstack width={43} height={2}></hstack>
        </hstack>

        <spacer size="small" /> */}

        {context.dimensions?.width! > 400 ? (
          <UpcomingMatchStats
            mount={mount}
            matchData={matchData}
            userPreds={userPreds}
            playerPickRates={playerPickRates}
          />
        ) : (
          <UpcomingMatchStatsMobile
            matchData={matchData}
            userPreds={userPreds}
            playerPickRates={playerPickRates}
          />
        )}

        {context.dimensions?.width! < 400 && (
          <PredictionsMobile mount={mount} userPreds={userPreds} />
        )}
      </vstack>
    </zstack>
  );
};

function UpcomingPageTopBar({ matchData }: { matchData: SingleUpcomingMatchSegment }): JSX.Element {
  const { match_date, match_event, match_series, match_time, event_logo } = matchData;
  return (
    <hstack padding="small" backgroundColor={CLR_DUTCH_WHITE} alignment="start middle">
      <spacer size="small" />

      <image url={event_logo} imageHeight={32} imageWidth={32} />

      <spacer size="small" />

      <vstack alignment="start middle" maxWidth={60}>
        <text color={CLR_WINE} style="heading" size="medium" wrap>
          {match_series}
        </text>
        <text color={CLR_WINE} style="body" size="small">
          {match_event}
        </text>
      </vstack>

      <spacer grow />

      <vstack alignment="start middle" maxWidth={40}>
        <text color={CLR_WINE} size="small">
          {match_date}
        </text>
        <text color={CLR_WINE} size="small">
          {match_time}
        </text>
      </vstack>

      <spacer size="small" />
    </hstack>
  );
}

function UpcomingPageTopBarMobile({
  matchData,
}: {
  matchData: SingleUpcomingMatchSegment;
}): JSX.Element {
  const { match_date, match_event, match_series, match_time, event_logo } = matchData;
  return (
    <hstack padding="small" backgroundColor={CLR_DUTCH_WHITE} alignment="start middle">
      <image url={event_logo} imageHeight={32} imageWidth={32} />
      <spacer size="small" />
      <vstack alignment="start middle" maxWidth={50}>
        <text color={CLR_WINE} weight="bold" size="small" wrap>
          {match_series}
        </text>
        <text color={CLR_WINE} size="xsmall">
          {match_event}
        </text>
      </vstack>

      <spacer grow />

      <vstack alignment="start middle" maxWidth={40}>
        <text color={CLR_WINE} size="xsmall">
          {match_date}
        </text>
        <text color={CLR_WINE} size="xsmall">
          {match_time}
        </text>
      </vstack>
    </hstack>
  );
}

function UpcomingMatchInfo({
  matchData,
  timeLeft,
  userPreds,
}: {
  matchData: SingleUpcomingMatchSegment;
  timeLeft: string;
  userPreds: PredictionType | null;
}): JSX.Element {
  const { team1, team2, rounds, logo1, logo2 } = matchData;
  return (
    <zstack width="100%">
      <hstack width={'100%'} height={'100%'} padding="medium">
        <spacer size="medium" />
        <hstack grow alignment="middle start" width={40}>
          <text
            width={50}
            alignment="center middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            wrap
          >
            {team1}
          </text>
          <hstack width={50} grow alignment="center middle">
            <image url={logo1} imageHeight={48} imageWidth={48} />
          </hstack>
        </hstack>

        <vstack grow alignment="center middle" width={20}>
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {timeLeft}
          </text>
          <spacer size="small" />
          {userPreds && (
            <vstack alignment="center middle">
              <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="small">
                Your Prediction
              </text>
              <hstack alignment="center middle">
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="small">
                  {userPreds.team1ScorePred}
                </text>
                <spacer size="small" />
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="small">
                  :
                </text>
                <spacer size="small" />
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="small">
                  {userPreds.team2ScorePred}
                </text>
              </hstack>
              <spacer size="small" />
            </vstack>
          )}
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {rounds}
          </text>
        </vstack>

        <hstack grow alignment="middle end" width={40}>
          <hstack width={50} grow alignment="center middle">
            <image url={logo2} imageHeight={48} imageWidth={48} />
          </hstack>
          <text
            alignment="center middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            wrap
            width={50}
          >
            {team2}
          </text>
        </hstack>
        <spacer size="medium" />
      </hstack>
    </zstack>
  );
}

function UpcomingMatchInfoMobile({
  matchData,
  timeLeft,
  userPreds,
}: {
  matchData: SingleUpcomingMatchSegment;
  timeLeft: string;
  userPreds: PredictionType | null;
}): JSX.Element {
  const { team1, team2, rounds, logo1, logo2 } = matchData;
  return (
    <zstack width="100%">
      <hstack width={'100%'} height={'100%'} padding="medium">
        <spacer grow />
        <hstack grow alignment="middle start" width={35}>
          <vstack grow alignment="center middle">
            <image url={logo1} imageHeight={64} imageWidth={64} />
            <spacer size="small" />
            <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
              {team1}
            </text>
          </vstack>
        </hstack>

        <vstack grow alignment="center middle" width={30}>
          <text color={CLR_DUTCH_WHITE} alignment="center middle" size="xsmall">
            {timeLeft}
          </text>
          <spacer size="xsmall" />
          {userPreds && (
            <vstack alignment="center middle">
              <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="xsmall">
                Your Prediction
              </text>
              <hstack alignment="center middle">
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="xsmall">
                  {userPreds.team1ScorePred}
                </text>
                <spacer size="xsmall" />
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="xsmall">
                  :
                </text>
                <spacer size="xsmall" />
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="xsmall">
                  {userPreds.team2ScorePred}
                </text>
              </hstack>
              <spacer size="xsmall" />
            </vstack>
          )}
          <text color={CLR_DUTCH_WHITE} alignment="center middle" size="xsmall">
            {rounds}
          </text>
        </vstack>

        <hstack grow alignment="middle end" width={35}>
          <vstack grow alignment="center middle">
            <image url={logo2} imageHeight={64} imageWidth={64} />
            <spacer size="small" />
            <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
              {team2}
            </text>
          </vstack>
        </hstack>
        <spacer grow />
      </hstack>
    </zstack>
  );
}

function UpcomingMatchStats({
  matchData,
  mount,
  userPreds,
  playerPickRates,
}: {
  matchData: SingleUpcomingMatchSegment;
  mount: () => void;
  userPreds: PredictionType | null;
  playerPickRates:
    | {
        name: string;
        pickRate: string;
      }[]
    | null;
}): JSX.Element {
  const { players1, players2, team1_short, team2_short } = matchData;
  return (
    <hstack width={'100%'} alignment="middle center" padding="medium">
      <hstack grow alignment="start middle" width={50}>
        <spacer grow />
        <vstack alignment="start middle">
          {players1.map((player) => {
            return (
              <Player1
                player={player}
                team1_short={team1_short}
                userPreds={userPreds}
                playerPickRates={playerPickRates}
              />
            );
          })}
        </vstack>
      </hstack>

      <spacer size="large" />

      <Predictions mount={mount} userPreds={userPreds} />

      <spacer size="large" />

      <hstack grow alignment="start middle" width={50}>
        <vstack alignment="start middle">
          {players2.map((player) => {
            return (
              <Player2
                player={player}
                team2_short={team2_short}
                userPreds={userPreds}
                playerPickRates={playerPickRates}
              />
            );
          })}
        </vstack>
        <spacer grow />
      </hstack>
    </hstack>
  );
}

function UpcomingMatchStatsMobile({
  matchData,
  userPreds,
  playerPickRates,
}: {
  matchData: SingleUpcomingMatchSegment;
  userPreds: PredictionType | null;
  playerPickRates:
    | {
        name: string;
        pickRate: string;
      }[]
    | null;
}): JSX.Element {
  const { players1, players2, team1_short, team2_short } = matchData;
  return (
    <hstack width={'100%'} alignment="middle center" padding="medium" gap="large">
      <hstack grow alignment="start middle" width={50}>
        <spacer grow />
        <vstack alignment="start middle">
          {players1.map((player) => {
            return (
              <Player1Mobile
                player={player}
                team1_short={team1_short}
                userPreds={userPreds}
                playerPickRates={playerPickRates}
              />
            );
          })}
        </vstack>
        <spacer grow />
      </hstack>

      <hstack grow alignment="start middle" width={50}>
        <spacer grow />
        <vstack alignment="start middle">
          {players2.map((player) => {
            return (
              <Player2Mobile
                player={player}
                team2_short={team2_short}
                userPreds={userPreds}
                playerPickRates={playerPickRates}
              />
            );
          })}
        </vstack>
        <spacer grow />
      </hstack>
    </hstack>
  );
}

function Player1({
  player,
  team1_short,
  userPreds,
  playerPickRates,
}: {
  player: {
    name: string;
    flag: string;
  };
  team1_short: string;
  userPreds: PredictionType | null;
  playerPickRates:
    | {
        name: string;
        pickRate: string;
      }[]
    | null;
}): JSX.Element {
  const isInSuperTeam = userPreds?.superTeam.some((p) => p.name === player.name) || false;

  return (
    <hstack grow alignment="start middle">
      <image
        url={`flags/${player.flag.replace('flag-', '')}.png`}
        imageHeight={16}
        imageWidth={16}
      />
      <vstack grow padding="small">
        <hstack alignment="start middle">
          <text color={CLR_DUTCH_WHITE} size="medium" overflow="ellipsis">
            {player.name}
          </text>
          <spacer size="xsmall" />
          {playerPickRates && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              {playerPickRates.find((p) => p.name === player.name)?.pickRate || '0%'}
            </text>
          )}
        </hstack>
        <hstack>
          <text color={'grey'} size="xsmall">
            {team1_short}
          </text>
          <spacer size="xsmall" />
          {isInSuperTeam && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              • SUPERTEAM
            </text>
          )}
        </hstack>
      </vstack>
      <spacer grow />
    </hstack>
  );
}

function Player1Mobile({
  player,
  team1_short,
  userPreds,
  playerPickRates,
}: {
  player: {
    name: string;
    flag: string;
  };
  team1_short: string;
  userPreds: PredictionType | null;
  playerPickRates:
    | {
        name: string;
        pickRate: string;
      }[]
    | null;
}): JSX.Element {
  const isInSuperTeam = userPreds?.superTeam.some((p) => p.name === player.name) || false;
  return (
    <hstack grow alignment="start middle" width={100}>
      <image
        url={`flags/${player.flag.replace('flag-', '')}.png`}
        imageHeight={16}
        imageWidth={16}
      />
      <vstack grow padding="small">
        <hstack alignment="start middle">
          <text color={CLR_DUTCH_WHITE} size="medium" overflow="ellipsis">
            {player.name}
          </text>
          <spacer size="xsmall" />
          {playerPickRates && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              {playerPickRates.find((p) => p.name === player.name)?.pickRate || '0%'}
            </text>
          )}
        </hstack>
        <hstack>
          <text color={'grey'} size="xsmall">
            {team1_short}
          </text>
          <spacer size="xsmall" />
          {isInSuperTeam && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              • SUPERTEAM
            </text>
          )}
        </hstack>
      </vstack>
    </hstack>
  );
}

function Player2({
  player,
  team2_short,
  userPreds,
  playerPickRates,
}: {
  player: {
    name: string;
    flag: string;
  };
  team2_short: string;
  userPreds: PredictionType | null;
  playerPickRates:
    | {
        name: string;
        pickRate: string;
      }[]
    | null;
}): JSX.Element {
  const isInSuperTeam = userPreds?.superTeam.some((p) => p.name === player.name) || false;

  return (
    <hstack grow alignment="start middle">
      <spacer grow />
      <image
        url={`flags/${player.flag.replace('flag-', '')}.png`}
        imageHeight={16}
        imageWidth={16}
      />
      <vstack grow padding="small">
        <hstack alignment="start middle">
          <text color={CLR_DUTCH_WHITE} size="medium" overflow="ellipsis">
            {player.name}
          </text>
          <spacer size="xsmall" />
          {playerPickRates && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              {playerPickRates.find((p) => p.name === player.name)?.pickRate || '0%'}
            </text>
          )}
        </hstack>
        <hstack>
          <text color={'grey'} size="xsmall">
            {team2_short}
          </text>
          <spacer size="xsmall" />
          {isInSuperTeam && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              • SUPERTEAM
            </text>
          )}
        </hstack>
      </vstack>
      <spacer grow />
    </hstack>
  );
}

function Player2Mobile({
  player,
  team2_short,
  userPreds,
  playerPickRates,
}: {
  player: {
    name: string;
    flag: string;
  };
  team2_short: string;
  userPreds: PredictionType | null;
  playerPickRates:
    | {
        name: string;
        pickRate: string;
      }[]
    | null;
}): JSX.Element {
  const isInSuperTeam = userPreds?.superTeam.some((p) => p.name === player.name) || false;
  return (
    <hstack grow alignment="start middle" width={100}>
      <image
        url={`flags/${player.flag.replace('flag-', '')}.png`}
        imageHeight={16}
        imageWidth={16}
      />
      <vstack grow padding="small">
        <hstack alignment="start middle">
          <text color={CLR_DUTCH_WHITE} size="medium" overflow="ellipsis">
            {player.name}
          </text>
          <spacer size="xsmall" />
          {playerPickRates && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              {playerPickRates.find((p) => p.name === player.name)?.pickRate || '0%'}
            </text>
          )}
        </hstack>
        <hstack>
          <text color={'grey'} size="xsmall">
            {team2_short}
          </text>
          <spacer size="xsmall" />
          {isInSuperTeam && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              • SUPERTEAM
            </text>
          )}
        </hstack>
      </vstack>
    </hstack>
  );
}

function Predictions({
  mount,
  userPreds,
}: {
  mount: () => void;
  userPreds: PredictionType | null;
}): JSX.Element {
  return (
    <vstack alignment="center middle">
      <hstack
        cornerRadius="large"
        backgroundColor={CLR_DUTCH_WHITE}
        padding="medium"
        alignment="center middle"
        gap="small"
        onPress={mount}
      >
        <text
          selectable={false}
          size="small"
          color={userPreds ? CLR_HIGHLIGHT_GREEN : CLR_WINE}
          weight="bold"
        >
          SUPERTEAM
        </text>
        {userPreds ? (
          <icon size="small" color={CLR_HIGHLIGHT_GREEN} name="checkmark-fill"></icon>
        ) : (
          <icon size="small" color={CLR_WINE} name="send-fill"></icon>
        )}
      </hstack>
    </vstack>
  );
}

function PredictionsMobile({
  mount,
  userPreds,
}: {
  mount: () => void;
  userPreds: PredictionType | null;
}): JSX.Element {
  return (
    <vstack grow alignment="center middle">
      <hstack
        cornerRadius="large"
        backgroundColor={CLR_DUTCH_WHITE}
        padding="small"
        alignment="center middle"
        gap="small"
        onPress={mount}
        width={50}
      >
        <text
          selectable={false}
          size="small"
          color={userPreds ? CLR_HIGHLIGHT_GREEN : CLR_WINE}
          weight="bold"
        >
          SUPERTEAM
        </text>
        {userPreds ? (
          <icon size="small" color={CLR_HIGHLIGHT_GREEN} name="checkmark-fill"></icon>
        ) : (
          <icon size="small" color={CLR_WINE} name="send-fill"></icon>
        )}
      </hstack>
    </vstack>
  );
}
