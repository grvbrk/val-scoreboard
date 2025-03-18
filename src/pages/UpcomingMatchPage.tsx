import { Devvit, useAsync, useInterval, useWebView } from '@devvit/public-api';
import { getMatchInfoFromRedis, postMatchPageTypeToRedis } from '../matches/fetchMatches.js';
import {
  PageType,
  SingleUpcomingMatchDataType,
  SingleUpcomingMatchSegment,
} from '../core/types.js';
import { getTimeRemaining } from '../utils/timeRemaining.js';
import { ErrorState } from '../components/Error.js';
import { CLR_DUTCH_WHITE, CLR_WINE } from '../core/colors.js';
import { WebviewToBlockMessage, BlocksToWebviewMessage } from '@/shared.js';
import { singleUpcomingMatchData } from 'src/core/data.js';

export const UpcomingMatchPage: Devvit.BlockComponent = (_, context) => {
  const { redis, postId, cache, userId, ui, settings, media } = context;

  const {
    data: matchData,
    loading,
    error,
  } = useAsync(async () => {
    if (!postId || !userId) return null;
    // const response = await media.upload({
    //   url: 'https://owcdn.net/img/65f6a278338a3.png',
    //   type: 'image',
    // });

    return singleUpcomingMatchData;
    // const matchInfoStr = await getMatchInfoFromRedis(redis, postId);
    // if (!matchInfoStr) return null;
    // const { match_page } = JSON.parse(matchInfoStr) as {
    //   team1: string;
    //   team2: string;
    //   match_page: string;
    // };

    // const VALBOARD_URL = await settings.get('VALBOARD_URL');
    // const url = `https://${VALBOARD_URL}/match/upcoming/single?url=${match_page}`;

    // return await cache(
    //   async () => {
    //     try {
    //       const response = await fetch(url);
    //       if (!response.ok) {
    //         ui.showToast({
    //           text: 'Error fetching data...',
    //           appearance: 'neutral',
    //         });
    //         throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    //       }
    //       return (await response.json()) as SingleUpcomingMatchDataType;
    //     } catch (error) {
    //       ui.showToast({
    //         text: 'Something went wrong...',
    //         appearance: 'neutral',
    //       });
    //       return singleUpcomingMatchData;
    //     }
    //   },
    //   {
    //     key: `${postId}${userId}`,
    //     ttl: 300000, // 5 min
    //   }
    // );
  });

  if (!matchData || loading || error) return <ErrorState />;

  const { timeLeft, hasTimeLeft } = getTimeRemaining(
    matchData.data.segments[0].unix_timestamp,
    'America/New_York'
  );

  const interval = useInterval(() => {}, 1000);

  if (hasTimeLeft) {
    interval.start();
  } else {
    interval.stop();
    // change page type to PageType.LIVE
    // postMatchPageTypeToRedis(redis, postId!, PageType.LIVE);
  }

  const { mount } = useWebView<WebviewToBlockMessage, BlocksToWebviewMessage>({
    onMessage: async (event, { postMessage }) => {
      const data = event as unknown as WebviewToBlockMessage;

      switch (data.type) {
        case 'INIT':
          postMessage({
            type: 'INIT_RESPONSE',
            payload: {
              postId: context.postId!,
              matchData: matchData,
            },
          });
          break;
        case 'GET_POKEMON_REQUEST':
          context.ui.showToast({ text: `Received message: ${JSON.stringify(data)}` });
          break;

        default:
          console.error('Unknown message type', data satisfies never);
          break;
      }
    },
  });

  return (
    <vstack width={'100%'} height={'100%'} cornerRadius="medium" backgroundColor={CLR_WINE}>
      <UpcomingPageTopBar matchData={matchData.data.segments[0]} />
      <UpcomingMatchInfo matchData={matchData.data.segments[0]} timeLeft={timeLeft} />
      <UpcomingMatchStats matchData={matchData.data.segments[0]} />
      <Predictions context={context} mount={mount} />
    </vstack>
  );
};

function UpcomingPageTopBar({ matchData }: { matchData: SingleUpcomingMatchSegment }): JSX.Element {
  const { match_date, match_event, match_series, match_time } = matchData;
  return (
    <hstack
      height="58px"
      padding="small"
      backgroundColor={CLR_DUTCH_WHITE}
      alignment="start middle"
    >
      <spacer size="small" />
      <image url={'event.png'} imageHeight={32} imageWidth={32} />
      <spacer size="small" />
      <vstack grow alignment="start middle">
        <text color={CLR_WINE} style="heading" size="medium" wrap>
          {match_series}
        </text>
        <text color={CLR_WINE} style="body" size="small">
          {match_event}
        </text>
      </vstack>

      <spacer grow size="large" />

      <vstack grow alignment="end middle">
        <text color={CLR_WINE} style="body" size="small">
          {match_date}
        </text>
        <text color={CLR_WINE} style="body" size="small">
          {match_time}
        </text>
      </vstack>

      <spacer size="medium" />
    </hstack>
  );
}

function UpcomingMatchInfo({
  matchData,
  timeLeft,
}: {
  matchData: SingleUpcomingMatchSegment;
  timeLeft: string;
}): JSX.Element {
  const { team1, team2, rounds } = matchData;
  return (
    <zstack width="100%">
      <hstack width={'100%'} height={'100%'} padding="medium">
        <hstack grow alignment="center middle">
          <spacer size="large" />

          <text
            alignment="center middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            maxWidth={'50%'}
            minWidth={'50%'}
            overflow="ellipsis"
            wrap
          >
            {team1}
          </text>
          <hstack maxWidth={'50%'} minWidth={'50%'} grow alignment="center middle">
            <image url={'aura.png'} imageHeight={64} imageWidth={64} />
          </hstack>
        </hstack>
        <vstack grow alignment="center middle">
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {timeLeft}
          </text>
          <spacer size="small" />

          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {rounds}
          </text>
        </vstack>
        <hstack grow alignment="center middle">
          <hstack maxWidth={'50%'} minWidth={'50%'} grow alignment="center middle">
            <image url={'ge.png'} imageHeight={64} imageWidth={64} />
          </hstack>
          <text
            alignment="start middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            maxWidth={'50%'}
            minWidth={'50%'}
            overflow="ellipsis"
            wrap
          >
            {team2}
          </text>
          <spacer size="large" />
        </hstack>
      </hstack>
    </zstack>
  );
}

function UpcomingMatchStats({ matchData }: { matchData: SingleUpcomingMatchSegment }): JSX.Element {
  const { players1, players2, team1_short, team2_short } = matchData;
  return (
    <hstack width={'100%'} alignment="middle center" padding="medium" gap="medium">
      <hstack grow alignment="start middle" gap="small" maxWidth={'50%'} minWidth={'50%'}>
        <spacer size="medium" />
        <vstack grow alignment="start middle" gap="medium" maxWidth={'50%'} minWidth={'50%'}>
          {players1.slice(0, 2).map((player) => {
            return <Player1 player={player} team1_short={team1_short} />;
          })}
        </vstack>
        <vstack grow alignment="start middle" gap="medium" maxWidth={'50%'} minWidth={'50%'}>
          {players1.slice(2).map((player) => {
            return <Player1 player={player} team1_short={team1_short} />;
          })}
        </vstack>
      </hstack>

      <hstack grow alignment="start middle" gap="small" maxWidth={'50%'} minWidth={'50%'}>
        <vstack grow alignment="start middle" gap="medium" maxWidth={'50%'} minWidth={'50%'}>
          {players2.slice(0, 3).map((player) => {
            return <Player2 player={player} team2_short={team2_short} />;
          })}
        </vstack>
        <vstack grow alignment="start middle" gap="medium" maxWidth={'50%'} minWidth={'50%'}>
          {players2.slice(3).map((player) => {
            return <Player2 player={player} team2_short={team2_short} />;
          })}
        </vstack>
        <spacer size="medium" />
      </hstack>
    </hstack>
  );
}

function Player1({
  player,
  team1_short,
}: {
  player: {
    name: string;
    flag: string;
  };
  team1_short: string;
}): JSX.Element {
  return (
    <hstack grow alignment="start middle">
      <image url={'ge.png'} imageHeight={25} imageWidth={25} />
      <vstack grow padding="small">
        <text color={CLR_DUTCH_WHITE} size="medium" overflow="ellipsis">
          {player.name}
        </text>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          {team1_short}
        </text>
      </vstack>
    </hstack>
  );
}

function Player2({
  player,
  team2_short,
}: {
  player: {
    name: string;
    flag: string;
  };
  team2_short: string;
}): JSX.Element {
  return (
    <hstack grow alignment="start middle">
      <image url={'uefa-champions-acm.png'} imageHeight={25} imageWidth={25} />
      <vstack grow padding="small">
        <text color={CLR_DUTCH_WHITE} size="medium" overflow="ellipsis">
          {player.name}
        </text>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          {team2_short}
        </text>
      </vstack>
    </hstack>
  );
}

function Predictions({
  context,
  mount,
}: {
  context: Devvit.Context;
  mount: () => void;
}): JSX.Element {
  return (
    <vstack grow alignment="center middle">
      <spacer width={'20px'} />
      <hstack alignment="center middle" gap="medium">
        <hstack
          cornerRadius="large"
          backgroundColor={'red'}
          padding="medium"
          alignment="center middle"
          gap="small"
          onPress={mount}
          border="thick"
          borderColor={CLR_DUTCH_WHITE}
        >
          <text selectable={false} size="medium" color={CLR_WINE} weight="bold">
            SUPERTEAM
          </text>
          <icon size="small" color={CLR_WINE} name="send-fill"></icon>
        </hstack>
        <hstack cornerRadius="large" padding="medium" alignment="center middle">
          <text
            selectable={false}
            size="medium"
            color={CLR_DUTCH_WHITE}
            onPress={() =>
              context.ui.navigateTo(
                'https://www.vlr.gg/460066/pulse-esports-vs-galakticos-challengers-league-2025-t-rkiye-birlik-split-2-elim'
              )
            }
          >
            vlr.gg
          </text>
          <icon size="small" color={CLR_DUTCH_WHITE} name="link-outline"></icon>
        </hstack>
      </hstack>
      <spacer width={'20px'} />
    </vstack>
  );
}

{
  /* <vstack grow alignment="middle center">
          <hstack grow alignment="middle center">
            <text color={CLR_DUTCH_WHITE} style="body" size="small">
              Head to Head
            </text>
          </hstack>
          <hstack grow alignment="middle center">
            <text color={CLR_DUTCH_WHITE} style="body" size="small">
              3
            </text>
            <spacer size="small" />
            <text color={CLR_DUTCH_WHITE} style="body" size="small">
              :
            </text>
            <spacer size="small" />
            <text color={CLR_DUTCH_WHITE} style="body" size="small">
              2
            </text>
          </hstack>
        </vstack> */
}
