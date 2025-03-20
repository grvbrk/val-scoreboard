import { Devvit, StateSetter, useAsync, useState } from '@devvit/public-api';
import { CLR_DUTCH_WHITE, CLR_WINE } from '../core/colors.js';
import { singleMatchResult } from '../core/data.js';
import { PlayerStat, SingleMatchResultSegment, SingleMatchResultType } from '../core/types.js';
import { ErrorState } from 'src/components/Error.js';
import { getMatchInfoFromRedis } from 'src/matches/fetchMatches.js';
import { totalRoundTime } from 'src/utils/totalRoundTime.js';
import { match } from 'assert';

export const MatchResultsPage: Devvit.BlockComponent = (_, context) => {
  const { redis, postId, cache, userId, ui, settings } = context;

  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const {
    data: matchData,
    loading,
    error,
  } = useAsync(async () => {
    if (!postId || !userId) return null;

    const matchInfoStr = await getMatchInfoFromRedis(redis, postId);
    if (!matchInfoStr) return null;
    const { match_page } = JSON.parse(matchInfoStr) as {
      team1: string;
      team2: string;
      match_page: string;
    };

    const VALBOARD_URL = await settings.get('VALBOARD_URL');
    const url = `https://${VALBOARD_URL}/match/results/single?url=${match_page}`;

    return singleMatchResult;
    // return await cache(
    //   async () => {
    //     try {
    //       const response = await fetch(url);
    //       if (!response.ok) {
    //         ui.showToast({
    //           text: 'Something went wrong...',
    //           appearance: 'neutral',
    //         });
    //         throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    //       }
    //       return (await response.json()) as SingleMatchResultType;
    //     } catch (error) {
    //       ui.showToast({
    //         text: 'Something went wrong...',
    //         appearance: 'neutral',
    //       });
    //       return singleMatchResult;
    //     }
    //   },
    //   {
    //     key: `${postId}${userId}`,
    //     ttl: 60000, // 1 min
    //   }
    // );
  });
  // console.log(matchData?.data.segments[0].rounds[0].team1_stats);

  if (!matchData || loading || error) return <ErrorState />;

  return (
    <vstack width={'100%'} height={'100%'} cornerRadius="medium" backgroundColor={CLR_WINE}>
      {/* <text>{context.dimensions?.width}</text> */}
      {context.dimensions?.width! > 600 ? (
        <ResultsPageTopBar matchData={matchData.data.segments[0]} />
      ) : (
        <ResultsPageTopBarMobile matchData={matchData.data.segments[0]} />
      )}

      {context.dimensions?.width! > 600 ? (
        <ResultsMatchInfo
          matchData={matchData.data.segments[0]}
          selectedTabIndex={selectedTabIndex}
        />
      ) : (
        <ResultsMatchInfoMobile
          matchData={matchData.data.segments[0]}
          selectedTabIndex={selectedTabIndex}
        />
      )}

      <vstack width="100%" alignment="center middle">
        <text alignment="center middle" color={'grey'} size={`xsmall`} width={80} wrap>
          GX.GC ban Fracture; SK.N ban Ascent; GX.GC pick Pearl; SK.N pick Lotus; GX.GC ban Haven;
          SK.N ban Split; Icebox remains
        </text>
      </vstack>

      <spacer size="small" />

      {context.dimensions?.width! > 600 ? (
        <OptionsBar
          matchData={matchData.data.segments[0]}
          selectedTabIndex={selectedTabIndex}
          setSelectedTabIndex={setSelectedTabIndex}
        />
      ) : (
        <OptionsBarMobile
          matchData={matchData.data.segments[0]}
          selectedTabIndex={selectedTabIndex}
          setSelectedTabIndex={setSelectedTabIndex}
        />
      )}

      {context.dimensions?.width! > 600 ? (
        <ResultsMatchStats
          matchData={matchData.data.segments[0]}
          selectedTabIndex={selectedTabIndex}
        />
      ) : (
        <ResultsMatchStatsMobile
          matchData={matchData.data.segments[0]}
          selectedTabIndex={selectedTabIndex}
        />
      )}
    </vstack>
  );
};

function ResultsPageTopBar({ matchData }: { matchData: SingleMatchResultSegment }): JSX.Element {
  const { match_event, match_series } = matchData;
  return (
    <hstack padding="small" backgroundColor={CLR_DUTCH_WHITE} alignment="start middle">
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
        <hstack alignment="center middle">
          <icon size="xsmall" color={CLR_WINE} name="link-outline" />
          <text color={CLR_WINE} style="body" size="small">
            vlr.gg
          </text>
        </hstack>
      </vstack>

      <spacer size="medium" />
    </hstack>
  );
}

function ResultsPageTopBarMobile({
  matchData,
}: {
  matchData: SingleMatchResultSegment;
}): JSX.Element {
  const { match_event, match_series } = matchData;
  return (
    <hstack padding="small" backgroundColor={CLR_DUTCH_WHITE} alignment="start middle">
      <image url={'event.png'} imageHeight={32} imageWidth={32} />
      <spacer size="small" />
      <vstack grow alignment="start middle" width={50}>
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
          <icon size="xsmall" color={CLR_WINE} name="link-outline" />
          <text color={CLR_WINE} size="xsmall">
            vlr.gg
          </text>
        </hstack>
      </vstack>
    </hstack>
  );
}

function ResultsMatchInfo({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleMatchResultSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const { team1, team2, team1_score, team2_score } = matchData;
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
            <image url={'aura.png'} imageHeight={48} imageWidth={48} />
          </hstack>
        </hstack>

        <hstack grow alignment="middle center" width={20}>
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {team1_score}
          </text>
          <spacer size="small" />
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            :
          </text>
          <spacer size="small" />
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {team2_score}
          </text>
        </hstack>

        <hstack grow alignment="middle end" width={40}>
          <hstack width={50} grow alignment="center middle">
            <image url={'ge.png'} imageHeight={48} imageWidth={48} />
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

function ResultsMatchInfoMobile({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleMatchResultSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const { team1, team2, team1_score, team2_score, rounds } = matchData;
  const roundInfo = rounds[selectedTabIndex];
  const totalTime = totalRoundTime(rounds.map((r) => r.map_duration ?? '00:00'));
  const totalTeam1Score = rounds.reduce((sum, r) => sum + parseInt(r.team1_round_score ?? '0'), 0);
  const totalTeam2Score = rounds.reduce((sum, r) => sum + parseInt(r.team2_round_score ?? '0'), 0);

  return (
    <vstack width="100%">
      <hstack width={'100%'} height={'100%'}>
        <spacer grow />

        <vstack grow alignment="center middle">
          <hstack grow alignment="center middle">
            <image url={'aura.png'} imageHeight={64} imageWidth={64} />
          </hstack>
          <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
            {team1}
          </text>
        </vstack>

        <hstack width={10} grow alignment="center middle">
          <text color={CLR_DUTCH_WHITE}>{roundInfo.team1_round_score ?? totalTeam1Score}</text>
        </hstack>

        <vstack grow alignment="middle center" width={20}>
          <hstack alignment="bottom center">
            <text color={'grey'} size="xsmall">
              {selectedTabIndex === 0 ? totalTime : roundInfo.map_duration!}
            </text>
          </hstack>

          <hstack>
            <text weight="bold" color={CLR_DUTCH_WHITE} size="xlarge">
              {team1_score}
            </text>
            <spacer size="small" />
            <text weight="bold" color={CLR_DUTCH_WHITE} size="xlarge">
              :
            </text>
            <spacer size="small" />
            <text weight="bold" color={CLR_DUTCH_WHITE} size="xlarge">
              {team2_score}
            </text>
          </hstack>

          <hstack grow alignment="top center" maxHeight={23} />
        </vstack>

        <hstack width={10} grow alignment="center middle">
          <text color={CLR_DUTCH_WHITE}>{roundInfo.team2_round_score ?? totalTeam2Score}</text>
        </hstack>

        <vstack grow alignment="center middle">
          <hstack grow alignment="center middle">
            <image url={'ge.png'} imageHeight={64} imageWidth={64} />
          </hstack>
          <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
            {team2}
          </text>
        </vstack>

        <spacer grow />
      </hstack>
      <spacer size="medium" />
    </vstack>
  );
}

function OptionsBar({
  matchData,
  selectedTabIndex,
  setSelectedTabIndex,
}: {
  matchData: SingleMatchResultSegment;
  selectedTabIndex: number;
  setSelectedTabIndex: StateSetter<number>;
}): JSX.Element {
  return (
    <hstack width={'100%'} alignment="start middle">
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
                  setSelectedTabIndex(i);
                }}
                minWidth={'60px'}
                alignment="center middle"
              >
                <text selectable={false} size="small" color={isActive ? CLR_WINE : CLR_DUTCH_WHITE}>
                  {r.map_name ?? 'All'}
                </text>
              </zstack>
              <spacer grow width="10px" />
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
}: {
  matchData: SingleMatchResultSegment;
  selectedTabIndex: number;
  setSelectedTabIndex: StateSetter<number>;
}): JSX.Element {
  return (
    <hstack width={'100%'} alignment="start middle">
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
              <spacer grow size="small" />
            </>
          );
        })}
      </hstack>
      <spacer grow />
    </hstack>
  );
}

function StatsHeading(): JSX.Element {
  return (
    <hstack width={80} gap="small">
      <hstack grow padding="small" alignment="center middle" width={'40px'}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          ACS
        </text>
      </hstack>

      <hstack grow padding="small" alignment="center middle" width={'100px'}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          K / D / A
        </text>
      </hstack>

      <hstack grow padding="small" alignment="center middle" width={'40px'}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          +/-
        </text>
      </hstack>

      <hstack grow padding="small" alignment="center middle" width={'50px'}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          HS%
        </text>
      </hstack>
    </hstack>
  );
}

function StatsHeadingMobile({ roundsLength }: { roundsLength: number }): JSX.Element {
  return (
    <hstack grow width={'100%'} alignment="end middle">
      <spacer size="small" />

      <hstack grow padding="xsmall" alignment="center middle" width={20} />

      <spacer size="small" />
      <hstack alignment="start middle" width={roundsLength * 7} grow />
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
    </hstack>
  );
}

function ResultsMatchStats({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleMatchResultSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const roundInfo = matchData.rounds[selectedTabIndex];

  return (
    <zstack width="100%">
      <hstack width={'100%'} alignment="top center" padding="medium" gap="small">
        {/* Team 1 */}
        <vstack grow alignment="top center">
          <hstack width={'100%'} alignment="middle end">
            <StatsHeading />
          </hstack>
          {roundInfo.team1_stats.map((stat) => {
            return <PlayerStats stat={stat} />;
          })}
        </vstack>
        <spacer grow size="medium" />
        {/* Team 2 */}
        <vstack grow alignment="top center">
          <hstack width={'100%'} alignment="middle end">
            <StatsHeading />
          </hstack>
          {roundInfo.team2_stats.map((stat) => {
            return <PlayerStats stat={stat} />;
          })}
        </vstack>
      </hstack>
    </zstack>
  );
}

function ResultsMatchStatsMobile({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleMatchResultSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const roundInfo = matchData.rounds[selectedTabIndex];
  const roundsLength = matchData.rounds.length - 1;

  return (
    <hstack width="100%">
      <vstack width={'100%'} padding="small">
        <StatsHeadingMobile roundsLength={roundsLength} />

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

function PlayerStats({ stat }: { stat: PlayerStat }): JSX.Element {
  return (
    <hstack width={'100%'}>
      <hstack grow alignment="start middle" width={20}>
        {/* <image url={'uefa-champions-acm.png'} imageHeight={25} imageWidth={25} /> */}
        <vstack grow padding="small">
          <text color={CLR_DUTCH_WHITE} size="xsmall" overflow="ellipsis">
            {stat.name}
          </text>
        </vstack>
      </hstack>

      <hstack grow width={80} gap="small">
        <hstack
          grow
          backgroundColor={CLR_DUTCH_WHITE}
          width={'40px'}
          padding="small"
          alignment="center middle"
        >
          <text size="xsmall">{stat.acs}</text>
        </hstack>

        <hstack
          grow
          backgroundColor={CLR_DUTCH_WHITE}
          width={'100px'}
          padding="small"
          alignment="center middle"
        >
          <text color={CLR_WINE} size="xsmall">
            {stat.k} / {stat.d} / {stat.a}
          </text>
        </hstack>

        <hstack
          grow
          backgroundColor={CLR_DUTCH_WHITE}
          width={'40px'}
          padding="small"
          alignment="center middle"
        >
          <text size="xsmall">{stat.diff_k_d}</text>
        </hstack>

        <hstack
          grow
          backgroundColor={CLR_DUTCH_WHITE}
          width={'50px'}
          padding="small"
          alignment="center middle"
        >
          <text color={CLR_WINE} size="xsmall">
            {stat.hs}
          </text>
        </hstack>
      </hstack>
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
    <hstack grow width={'100%'} alignment="start middle">
      <spacer size="small" />

      <hstack alignment="start middle" padding="xsmall" width={20} grow>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          {stat.name}
        </text>
      </hstack>

      <spacer size="small" />

      {stat.agents.length > 0 && (
        <hstack alignment="start middle" width={roundsLength * 7} grow>
          {stat.agents.map((agent) => {
            return (
              <image url={`agents/${agent.toLowerCase()}.png`} imageHeight={16} imageWidth={16} />
              // <image url={`agents/yoru.png`} imageHeight={16} imageWidth={16} />
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
        grow
      >
        <text size="xsmall">{stat.acs}</text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={33}
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
        grow
      >
        <text size="xsmall">{stat.diff_k_d}</text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={17}
        grow
      >
        <text size="xsmall">{stat.hs}</text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={17}
        grow
      >
        <text size="xsmall">{stat.adr}</text>
      </hstack>
    </hstack>
  );
}
