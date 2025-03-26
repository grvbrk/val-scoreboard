import { Devvit, StateSetter, useAsync, useInterval, useState } from '@devvit/public-api';
import { ErrorState } from '../components/Error.js';
import {
  AllMatchResultSegment,
  AllUpcomingMatchSegment,
  PageType,
  PlayerStat,
  SingleLiveMatchData,
  SingleLiveMatchSegment,
} from 'src/core/types.js';
import { getMatchInfoFromRedis, postMatchPageTypeToRedis } from 'src/redis/matches.js';
import {
  CLR_DARK_1,
  CLR_DUTCH_WHITE,
  CLR_HIGHLIGHT_GREEN,
  CLR_HIGHLIGHT_RED,
  CLR_WINE,
} from 'src/core/colors.js';
import { totalRoundTime } from 'src/utils/totalRoundTime.js';
import { MAPS } from 'src/utils/maps.js';
import { ResultsPreview, ResultsPreviewMobile } from 'src/components/ResultsPreview.js';
import { LoadingState } from 'src/components/Loading.js';

export const LiveMatchPage: Devvit.BlockComponent<{
  setPage: StateSetter<string | null>;
}> = (props, context) => {
  const { postId, userId, settings, ui, cache, redis } = context;

  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [bgMaps, setBgMaps] = useState<{ name: string; show: boolean }[]>(
    MAPS.map((map) => {
      return { name: map, show: true };
    })
  );

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  async function updatePostPreview() {
    const post = await context.reddit.getPostById(postId!);
    const upcomingMatchInfo = JSON.parse(
      (await getMatchInfoFromRedis(redis, postId!)) as string
    ) as AllUpcomingMatchSegment;

    await post.setCustomPostPreview(() => {
      if (context.dimensions?.width! > 400) {
        return (
          <ResultsPreview
            upcomingMatchInfo={upcomingMatchInfo as unknown as AllMatchResultSegment}
          />
        );
      }
      return (
        <ResultsPreviewMobile
          upcomingMatchInfo={upcomingMatchInfo as unknown as AllMatchResultSegment}
        />
      );
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
      const url = `${VALBOARD_URL}/match/live/single?url=${match_page}`;

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
            const data = (await response.json()) as SingleLiveMatchData;
            if (data.data.status != 200) {
              throw Error(`Error! Status code: ${data.data.status}`);
            }
            return data;
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
          key: `live-${postId}`,
          ttl: 60000, // 1 min
        }
      );
    },
    {
      depends: [refreshTrigger],
      finally(data, error) {
        if (error) {
          console.error('Failed to load data:', error);
          return null;
        }
        if (data != null) {
          if (!data.data.is_live) {
            props.setPage(PageType.RESULTS);
            postMatchPageTypeToRedis(redis, postId!, PageType.RESULTS);
            updatePostPreview();
            return null;
          }
          const newBgMaps = data.data.segments[0].rounds
            .filter((r) => r.map_name)
            .map((map) => {
              return { name: map.map_name, show: true };
            }) as { name: string; show: boolean }[];
          setBgMaps(newBgMaps);
        }
      },
    }
  );

  if (error) return <ErrorState />;
  if (!matchData || loading) return <LoadingState />;

  const interval = useInterval(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, 60000); // 1 min

  if (matchData.data.is_live) {
    interval.start();
  } else {
    interval.stop();
  }

  return (
    <zstack width={'100%'} height={'100%'}>
      <hstack height={100} width={100}>
        {bgMaps.map(
          (map) =>
            map.show && (
              <image
                url={`maps/${map.name === 'TBD' ? 'Haven' : map.name}.png`}
                imageHeight={100}
                imageWidth={100}
                height={100}
                width={100}
                resizeMode="cover"
                grow
              />
            )
        )}
      </hstack>
      <vstack width={'100%'} height={'100%'}>
        {context.dimensions?.width! > 500 ? (
          <LivePageTopBar matchData={matchData.data.segments[0]} />
        ) : (
          <LivePageTopBarMobile matchData={matchData.data.segments[0]} />
        )}

        {context.dimensions?.width! > 500 ? (
          <LiveMatchInfo
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
          />
        ) : (
          <LiveMatchInfoMobile
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
          />
        )}

        <spacer size="small" />

        <vstack width="100%" alignment="center middle">
          <text alignment="center middle" color={'grey'} size={`xsmall`} width={80} wrap>
            {matchData.data.segments[0].team_picks}
          </text>
        </vstack>

        <spacer size="small" />

        {context.dimensions?.width! > 500 ? (
          <OptionsBar
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
            setSelectedTabIndex={setSelectedTabIndex}
            setBgMaps={setBgMaps}
          />
        ) : (
          <OptionsBarMobile
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
            setSelectedTabIndex={setSelectedTabIndex}
            setBgMaps={setBgMaps}
          />
        )}

        {context.dimensions?.width! > 500 ? (
          <LiveMatchStats
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
          />
        ) : (
          <LiveMatchStatsMobile
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
          />
        )}
      </vstack>
    </zstack>
  );
};

function LivePageTopBar({ matchData }: { matchData: SingleLiveMatchSegment }): JSX.Element {
  const { match_event, match_series, event_logo } = matchData;
  return (
    <hstack padding="small" backgroundColor={CLR_DUTCH_WHITE} alignment="start middle">
      <image
        url={`teams/${event_logo.replace('//owcdn.net/img/', '')}`}
        imageHeight={32}
        imageWidth={32}
      />
      <spacer size="small" />
      <vstack grow alignment="start middle" width={60}>
        <text color={CLR_WINE} weight="bold" size="medium" wrap>
          {match_series}
        </text>
        <text color={CLR_WINE} size="small">
          {match_event}
        </text>
      </vstack>

      <spacer grow size="large" />

      <vstack grow alignment="end middle">
        <hstack alignment="center middle">
          <text color={CLR_HIGHLIGHT_RED} size="small">
            LIVE
          </text>
        </hstack>
      </vstack>

      <spacer size="medium" />
    </hstack>
  );
}

function LivePageTopBarMobile({ matchData }: { matchData: SingleLiveMatchSegment }): JSX.Element {
  const { match_event, match_series, event_logo } = matchData;
  return (
    <hstack padding="small" backgroundColor={CLR_DUTCH_WHITE} alignment="start middle">
      <image
        url={`teams/${event_logo.replace('//owcdn.net/img/', '')}`}
        imageHeight={32}
        imageWidth={32}
      />
      <spacer size="small" />
      <vstack grow alignment="start middle" width={60}>
        <text color={CLR_WINE} weight="bold" size="small" wrap>
          {match_series}
        </text>
        <text color={CLR_WINE} size="xsmall">
          {match_event}
        </text>
      </vstack>

      <spacer grow size="medium" />

      <vstack grow alignment="start middle" maxWidth={40}>
        <hstack alignment="center middle">
          <text color={CLR_HIGHLIGHT_RED} size="xsmall">
            LIVE
          </text>
        </hstack>
      </vstack>
    </hstack>
  );
}

function LiveMatchInfo({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleLiveMatchSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const { team1, team2, team1_score, team2_score, rounds, logo1, logo2 } = matchData;
  const roundInfo = rounds[selectedTabIndex];
  const totalTime = totalRoundTime(rounds.map((r) => r.map_duration ?? '00:00'));
  const totalTeam1Score = rounds.reduce((sum, r) => sum + parseInt(r.team1_round_score ?? '0'), 0);
  const totalTeam2Score = rounds.reduce((sum, r) => sum + parseInt(r.team2_round_score ?? '0'), 0);

  return (
    <zstack width="100%">
      <vstack width="100%">
        <spacer size="small" />

        <hstack width={'100%'} height={'100%'}>
          <spacer grow />

          <vstack width={30} grow alignment="center middle">
            <hstack grow alignment="center middle">
              <image
                url={`teams/${logo1.replace('//owcdn.net/img/', '')}`}
                imageHeight={64}
                imageWidth={64}
              />
            </hstack>
            <spacer size="small" />
            <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
              {team1}
            </text>
          </vstack>

          <hstack width={10} grow alignment="center middle">
            <text
              color={
                selectedTabIndex === 0
                  ? totalTeam1Score > totalTeam2Score
                    ? 'green'
                    : CLR_DUTCH_WHITE
                  : parseInt(roundInfo.team1_round_score!) > parseInt(roundInfo.team2_round_score!)
                    ? 'green'
                    : CLR_DUTCH_WHITE
              }
            >
              {roundInfo.team1_round_score ?? totalTeam1Score}
            </text>
          </hstack>

          <vstack grow alignment="middle center" width={20}>
            <hstack alignment="bottom center">
              <text color={'grey'} size="xsmall">
                {selectedTabIndex === 0 ? totalTime : roundInfo.map_duration!}
              </text>
            </hstack>

            <hstack>
              <text
                weight="bold"
                color={parseInt(team1_score) > parseInt(team2_score) ? 'green' : CLR_DUTCH_WHITE}
                size="xlarge"
              >
                {team1_score}
              </text>
              <spacer size="small" />
              <text weight="bold" color={CLR_DUTCH_WHITE} size="xlarge">
                :
              </text>
              <spacer size="small" />
              <text
                weight="bold"
                color={parseInt(team2_score) > parseInt(team1_score) ? 'green' : CLR_DUTCH_WHITE}
                size="xlarge"
              >
                {team2_score}
              </text>
            </hstack>

            <hstack grow alignment="top center" maxHeight={23} />
          </vstack>

          <hstack width={10} grow alignment="center middle">
            <text
              color={
                selectedTabIndex === 0
                  ? totalTeam2Score > totalTeam1Score
                    ? 'green'
                    : CLR_DUTCH_WHITE
                  : parseInt(roundInfo.team2_round_score!) > parseInt(roundInfo.team1_round_score!)
                    ? 'green'
                    : CLR_DUTCH_WHITE
              }
            >
              {roundInfo.team2_round_score ?? totalTeam2Score}
            </text>
          </hstack>

          <vstack width={30} grow alignment="center middle">
            <hstack grow alignment="center middle">
              <image
                url={`teams/${logo2.replace('//owcdn.net/img/', '')}`}
                imageHeight={64}
                imageWidth={64}
              />
            </hstack>
            <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
              {team2}
            </text>
          </vstack>

          <spacer grow />
        </hstack>
      </vstack>
    </zstack>
  );
}

function LiveMatchInfoMobile({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleLiveMatchSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const { team1, team2, team1_score, team2_score, rounds, logo1, logo2 } = matchData;
  const roundInfo = rounds[selectedTabIndex];
  const totalTime = totalRoundTime(rounds.map((r) => r.map_duration ?? '00:00'));
  const totalTeam1Score = rounds.reduce((sum, r) => sum + parseInt(r.team1_round_score ?? '0'), 0);
  const totalTeam2Score = rounds.reduce((sum, r) => sum + parseInt(r.team2_round_score ?? '0'), 0);

  return (
    <vstack width="100%">
      <spacer size="small" />
      <hstack width={'100%'} height={'100%'}>
        <spacer grow />

        <vstack width={30} grow alignment="center middle">
          <hstack grow alignment="center middle">
            <image
              url={`teams/${logo1.replace('//owcdn.net/img/', '')}`}
              imageHeight={64}
              imageWidth={64}
            />
          </hstack>
          <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
            {team1}
          </text>
        </vstack>

        <hstack width={10} grow alignment="center middle">
          <text
            color={
              selectedTabIndex === 0
                ? totalTeam1Score > totalTeam2Score
                  ? 'green'
                  : CLR_DUTCH_WHITE
                : parseInt(roundInfo.team1_round_score!) > parseInt(roundInfo.team2_round_score!)
                  ? 'green'
                  : CLR_DUTCH_WHITE
            }
          >
            {roundInfo.team1_round_score ?? totalTeam1Score}
          </text>
        </hstack>

        <vstack grow alignment="middle center" width={20}>
          <hstack alignment="bottom center">
            <text color={'grey'} size="xsmall">
              {selectedTabIndex === 0 ? totalTime : roundInfo.map_duration!}
            </text>
          </hstack>

          <hstack>
            <text
              weight="bold"
              color={parseInt(team1_score) > parseInt(team2_score) ? 'green' : CLR_DUTCH_WHITE}
              size="xlarge"
            >
              {team1_score}
            </text>
            <spacer size="small" />
            <text weight="bold" color={CLR_DUTCH_WHITE} size="xlarge">
              :
            </text>
            <spacer size="small" />
            <text
              weight="bold"
              color={parseInt(team2_score) > parseInt(team1_score) ? 'green' : CLR_DUTCH_WHITE}
              size="xlarge"
            >
              {team2_score}
            </text>
          </hstack>

          <hstack grow alignment="top center" maxHeight={23} />
        </vstack>

        <hstack width={10} grow alignment="center middle">
          <text
            color={
              selectedTabIndex === 0
                ? totalTeam2Score > totalTeam1Score
                  ? 'green'
                  : CLR_DUTCH_WHITE
                : parseInt(roundInfo.team2_round_score!) > parseInt(roundInfo.team1_round_score!)
                  ? 'green'
                  : CLR_DUTCH_WHITE
            }
          >
            {roundInfo.team2_round_score ?? totalTeam2Score}
          </text>
        </hstack>

        <vstack width={30} grow alignment="center middle">
          <hstack grow alignment="center middle">
            <image
              url={`teams/${logo2.replace('//owcdn.net/img/', '')}`}
              imageHeight={64}
              imageWidth={64}
            />
          </hstack>
          <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
            {team2}
          </text>
        </vstack>

        <spacer grow />
      </hstack>
    </vstack>
  );
}

function OptionsBar({
  matchData,
  selectedTabIndex,
  setSelectedTabIndex,
  setBgMaps,
}: {
  matchData: SingleLiveMatchSegment;
  selectedTabIndex: number;
  setSelectedTabIndex: StateSetter<number>;
  setBgMaps: StateSetter<
    {
      name: string;
      show: boolean;
    }[]
  >;
}): JSX.Element {
  return (
    <hstack width={'100%'} alignment="center middle">
      <spacer grow />
      <hstack alignment="start middle">
        {matchData.rounds.map((r, i) => {
          const isActive = selectedTabIndex === i;
          return (
            <>
              <zstack
                cornerRadius="large"
                backgroundColor={isActive ? CLR_DUTCH_WHITE : undefined}
                padding="small"
                onPress={() => {
                  setBgMaps((prev) =>
                    prev.map((map) =>
                      r.map_name === null
                        ? { ...map, show: true }
                        : map.name === r.map_name
                          ? { ...map, show: true }
                          : { ...map, show: false }
                    )
                  );
                  setSelectedTabIndex(i);
                }}
                minWidth={'60px'}
                alignment="center middle"
              >
                <text selectable={false} size="small" color={isActive ? CLR_WINE : CLR_DUTCH_WHITE}>
                  {r.map_name ?? 'All'}
                </text>
              </zstack>
            </>
          );
        })}
      </hstack>
      <spacer grow />
    </hstack>
  );
}

function OptionsBarMobile({
  matchData,
  selectedTabIndex,
  setSelectedTabIndex,
  setBgMaps,
}: {
  matchData: SingleLiveMatchSegment;
  selectedTabIndex: number;
  setSelectedTabIndex: StateSetter<number>;
  setBgMaps: StateSetter<
    {
      name: string;
      show: boolean;
    }[]
  >;
}): JSX.Element {
  return (
    <hstack width={'100%'} alignment="center middle">
      <spacer grow />
      <hstack alignment="start middle">
        {matchData.rounds.map((r, i) => {
          const isActive = selectedTabIndex === i;
          return (
            <>
              <zstack
                cornerRadius="large"
                backgroundColor={isActive ? CLR_DUTCH_WHITE : undefined}
                padding="small"
                onPress={() => {
                  setBgMaps((prev) =>
                    prev.map((map) =>
                      r.map_name === null
                        ? { ...map, show: true }
                        : map.name === r.map_name
                          ? { ...map, show: true }
                          : { ...map, show: false }
                    )
                  );
                  setSelectedTabIndex(i);
                }}
                minWidth={'50px'}
                alignment="center middle"
              >
                <text
                  selectable={false}
                  size="xsmall"
                  color={isActive ? CLR_WINE : CLR_DUTCH_WHITE}
                >
                  {r.map_name ?? 'All'}
                </text>
              </zstack>
            </>
          );
        })}
      </hstack>
      <spacer grow />
    </hstack>
  );
}

function StatsHeading({
  roundsLength,
  playerStat,
}: {
  roundsLength: number;
  playerStat: PlayerStat;
}): JSX.Element {
  return (
    <hstack grow width={'100%'} alignment="end middle">
      <spacer size="small" />

      <hstack grow padding="xsmall" alignment="center middle" width={30} />

      <spacer size="small" />
      {playerStat.agents.length > 0 && (
        <hstack alignment="start middle" width={roundsLength * 9} grow />
      )}
      <spacer size="small" />

      <hstack grow padding="xsmall" alignment="center middle" width={16}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          ACS
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={33}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          K / D / A
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={16}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          +/-
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={17}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          HS%
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={17}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          ADR
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={17}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          KAST
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={17}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          FK
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={17}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          FD
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={16}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          +/-
        </text>
      </hstack>

      <spacer size="small" />
    </hstack>
  );
}

function StatsHeadingMobile({
  roundsLength,
  playerStat,
}: {
  roundsLength: number;
  playerStat: PlayerStat;
}): JSX.Element {
  return (
    <hstack grow width={'100%'} alignment="end middle">
      <spacer size="small" />

      <hstack grow padding="xsmall" alignment="center middle" width={30} />

      <spacer size="small" />
      {playerStat.agents.length > 0 && (
        <hstack alignment="start middle" width={roundsLength * 9} grow />
      )}
      <spacer size="small" />

      <hstack grow padding="xsmall" alignment="center middle" width={16}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          ACS
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={33}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          K / D / A
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={16}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          +/-
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={17}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          HS%
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={17}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          ADR
        </text>
      </hstack>

      <spacer size="small" />
    </hstack>
  );
}

function LiveMatchStats({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleLiveMatchSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const roundInfo = matchData.rounds[selectedTabIndex];
  const roundsLength = matchData.rounds.length - 1;

  return (
    <hstack width="100%">
      <vstack width={'100%'} padding="small">
        <StatsHeading roundsLength={roundsLength} playerStat={roundInfo.team1_stats[0]} />

        <vstack alignment="start middle">
          {roundInfo.team1_stats.map((stat) => {
            return <PlayerStats stat={stat} roundsLength={roundsLength} />;
          })}
        </vstack>

        <spacer width={'5px'} />

        <vstack alignment="start middle">
          {roundInfo.team2_stats.map((stat) => {
            return <PlayerStats stat={stat} roundsLength={roundsLength} />;
          })}
        </vstack>
      </vstack>
    </hstack>
  );
}

function LiveMatchStatsMobile({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleLiveMatchSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const roundInfo = matchData.rounds[selectedTabIndex];
  const roundsLength = matchData.rounds.length - 1;

  return (
    <hstack width="100%">
      <vstack width={'100%'} padding="small">
        <StatsHeadingMobile roundsLength={roundsLength} playerStat={roundInfo.team1_stats[0]} />

        <vstack alignment="start middle">
          {roundInfo.team1_stats.map((stat) => {
            return <PlayerStatsMobile stat={stat} roundsLength={roundsLength} />;
          })}
        </vstack>

        <spacer width={'5px'} />

        <vstack alignment="start middle">
          {roundInfo.team2_stats.map((stat) => {
            return <PlayerStatsMobile stat={stat} roundsLength={roundsLength} />;
          })}
        </vstack>
      </vstack>
    </hstack>
  );
}

function PlayerStats({
  stat,
  roundsLength,
}: {
  stat: PlayerStat;
  roundsLength: number;
}): JSX.Element {
  return (
    <hstack grow width={'100%'} height={'100%'} alignment="start middle">
      <spacer size="small" />

      <hstack alignment="start middle" padding="xsmall" height={'100%'} width={30} grow>
        <image
          url={`flags/${stat.flag.replace('flag-', '')}.png`}
          imageHeight={14}
          imageWidth={14}
          height={100}
          resizeMode="fit"
        />
        <spacer width={'3px'} />
        <text alignment="start middle" color={CLR_DUTCH_WHITE} size="small">
          {stat.name}
        </text>
      </hstack>

      <spacer size="small" />

      {stat.agents.length > 0 && (
        <hstack alignment="start middle" width={roundsLength * 9} grow>
          {stat.agents.map((agent) => {
            return (
              <image url={`agents/${agent.toLowerCase()}.png`} imageHeight={20} imageWidth={20} />
            );
          })}
        </hstack>
      )}

      <spacer size="small" />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={16}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.acs}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={33}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.k} / {stat.d} / {stat.a}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={16}
        height={'100%'}
        grow
      >
        <text
          color={
            stat.diff_k_d.startsWith('-')
              ? CLR_HIGHLIGHT_RED
              : stat.diff_k_d.startsWith('+')
                ? CLR_HIGHLIGHT_GREEN
                : CLR_WINE
          }
          size="xsmall"
        >
          {stat.diff_k_d}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.hs}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.adr}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.kast}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.fk}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.fd}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text
          color={
            stat.diff_fk_fd.startsWith('-')
              ? CLR_HIGHLIGHT_RED
              : stat.diff_fk_fd.startsWith('+')
                ? CLR_HIGHLIGHT_GREEN
                : CLR_WINE
          }
          size="xsmall"
        >
          {stat.diff_fk_fd}
        </text>
      </hstack>

      <spacer size="small" />
    </hstack>
  );
}

function PlayerStatsMobile({
  stat,
  roundsLength,
}: {
  stat: PlayerStat;
  roundsLength: number;
}): JSX.Element {
  return (
    <hstack grow width={'100%'} height={'100%'} alignment="start middle">
      <spacer size="small" />

      <hstack alignment="start middle" padding="xsmall" height={'100%'} width={30} grow>
        <image
          url={`flags/${stat.flag.replace('flag-', '')}.png`}
          imageHeight={10}
          imageWidth={10}
          height={100}
          resizeMode="fit"
        />
        <spacer width={'3px'} />
        <text alignment="start middle" color={CLR_DUTCH_WHITE} size="xsmall">
          {stat.name}
        </text>
      </hstack>

      <spacer size="small" />

      {stat.agents.length > 0 && (
        <hstack alignment="start middle" width={roundsLength * 9} grow>
          {stat.agents.map((agent) => {
            return (
              <image url={`agents/${agent.toLowerCase()}.png`} imageHeight={16} imageWidth={16} />
            );
          })}
        </hstack>
      )}

      <spacer size="small" />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={16}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.acs}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={33}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.k} / {stat.d} / {stat.a}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={16}
        height={'100%'}
        grow
      >
        <text
          color={
            stat.diff_k_d.startsWith('-')
              ? CLR_HIGHLIGHT_RED
              : stat.diff_k_d.startsWith('+')
                ? CLR_HIGHLIGHT_GREEN
                : CLR_WINE
          }
          size="xsmall"
        >
          {stat.diff_k_d}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.hs}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.adr}
        </text>
      </hstack>

      <spacer size="small" />
    </hstack>
  );
}
