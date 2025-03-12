import { Devvit, StateSetter, useState } from '@devvit/public-api';
import { CLR_DUTCH_WHITE, CLR_WINE } from '../core/colors.js';
import { match_data } from '../core/data.js';
import { MatchDataType, PlayerStat, Tabs } from '../core/types.js';

export const MatchResultsPage: Devvit.BlockComponent = (_, context) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [matchData, setMatchData] = useState(match_data);

  return (
    <vstack width={'100%'} height={'100%'} cornerRadius="medium">
      {/* <text>{context.dimensions!.width}</text> */}
      <ResultsPageTopBar matchData={matchData} />
      <ResultsMatchInfo matchData={matchData} />
      <OptionsBar
        matchData={matchData}
        selectedTabIndex={selectedTabIndex}
        setSelectedTabIndex={setSelectedTabIndex}
      />
      <ResultsMatchStats matchData={matchData} selectedTabIndex={selectedTabIndex} />
    </vstack>
  );
};

export function ResultsPageTopBar({ matchData }: { matchData: MatchDataType }): JSX.Element {
  return (
    <hstack
      height="58px"
      padding="small"
      backgroundColor={CLR_DUTCH_WHITE}
      alignment="start middle"
    >
      <spacer width={'10px'} />
      <vstack alignment="start middle">
        <text color={CLR_WINE} style="heading" size="medium" wrap>
          {matchData.tournament_name}
        </text>
        <text color={CLR_WINE} style="body" size="small">
          {matchData.round_info}
        </text>
      </vstack>
    </hstack>
  );
}

export function ResultsMatchInfo({ matchData }: { matchData: MatchDataType }): JSX.Element {
  return (
    <zstack width="100%" backgroundColor={CLR_WINE}>
      <hstack width={'100%'} height={'100%'} padding="medium">
        <hstack alignment="middle start">
          <text
            alignment="end middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            maxWidth={'50%'}
            width={'200px'}
            wrap
          >
            {matchData.team1}
          </text>
          <spacer size="medium" />
          <image url={'uefa-champions-acm.png'} imageHeight={64} imageWidth={64} />
        </hstack>
        <hstack grow alignment="middle center">
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {matchData.score1}
          </text>
          <spacer size="small" />
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            :
          </text>
          <spacer size="small" />
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {matchData.score2}
          </text>
        </hstack>
        <hstack alignment="middle end">
          <image url={'uefa-champions-acm.png'} imageHeight={64} imageWidth={64} />
          <spacer size="medium" />
          <text
            alignment="start middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            maxWidth={'50%'}
            width={'200px'}
            wrap
          >
            {matchData.team2}
          </text>
        </hstack>
      </hstack>
    </zstack>
  );
}

export function OptionsBar({
  matchData,
  selectedTabIndex,
  setSelectedTabIndex,
}: {
  matchData: MatchDataType;
  selectedTabIndex: number;
  setSelectedTabIndex: StateSetter<number>;
}): JSX.Element {
  const tabValues = Object.values(Tabs);
  return (
    <hstack width={'100%'} backgroundColor={CLR_WINE}>
      <spacer width="20px" />
      <hstack alignment="start middle">
        {Object.values(matchData.stats).map((_, i) => {
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
              >
                <text selectable={false} size="small" color={isActive ? CLR_WINE : CLR_DUTCH_WHITE}>
                  {tabValues[i]}
                </text>
              </zstack>
              <spacer width="10px" />
            </>
          );
        })}
      </hstack>
      <spacer grow />
    </hstack>
  );
}

export function ResultsMatchStats({
  matchData,
  selectedTabIndex,
}: {
  matchData: MatchDataType;
  selectedTabIndex: number;
}): JSX.Element {
  const roundInfo = Object.values(matchData.stats)[selectedTabIndex];

  return (
    <zstack width="100%" backgroundColor={CLR_WINE}>
      <hstack width={'100%'} alignment="middle center" padding="medium" gap="small">
        <vstack grow alignment="start middle">
          <hstack width={'100%'} alignment="middle end">
            <StatsHeading />
          </hstack>
          {Object.entries(roundInfo.team1).map((stat) => {
            return <PlayerStats stat={stat} />;
          })}
        </vstack>
        <spacer grow size="medium" />
        <vstack grow alignment="end middle">
          <hstack width={'100%'} alignment="middle end">
            <StatsHeading />
          </hstack>
          {Object.entries(roundInfo.team2).map((stat) => {
            return <PlayerStats stat={stat} />;
          })}
        </vstack>
      </hstack>
    </zstack>
  );
}

export function StatsHeading(): JSX.Element {
  return (
    <hstack width={'70%'} gap="small">
      <hstack grow padding="small" alignment="center middle" width={'40px'}>
        <text color={CLR_DUTCH_WHITE} size="small">
          ACS
        </text>
      </hstack>

      <hstack grow padding="small" alignment="center middle" width={'100px'}>
        <text color={CLR_DUTCH_WHITE} size="small">
          K / D / A
        </text>
      </hstack>

      <hstack grow padding="small" alignment="center middle" width={'40px'}>
        <text color={CLR_DUTCH_WHITE} size="small">
          +/-
        </text>
      </hstack>

      <hstack grow padding="small" alignment="center middle" width={'50px'}>
        <text color={CLR_DUTCH_WHITE} size="small">
          HS%
        </text>
      </hstack>
    </hstack>
  );
}

export function PlayerStats({ stat }: { stat: [string, PlayerStat] }): JSX.Element {
  const playerName = stat[0];
  const playerStat = stat[1];
  return (
    <hstack width={'100%'}>
      <hstack grow alignment="start middle" width={'30%'}>
        <image url={'uefa-champions-acm.png'} imageHeight={25} imageWidth={25} />
        <vstack grow padding="small" maxWidth={'70%'}>
          <text color={CLR_DUTCH_WHITE} size="medium" overflow="ellipsis">
            {playerName}
          </text>
          <text color={CLR_DUTCH_WHITE} size="xsmall">
            HEV
          </text>
        </vstack>
      </hstack>

      <hstack grow width={'70%'} gap="small">
        <hstack
          grow
          backgroundColor={CLR_DUTCH_WHITE}
          width={'40px'}
          padding="small"
          alignment="center middle"
        >
          <text size="small">{playerStat.ACS}</text>
        </hstack>

        <hstack
          grow
          backgroundColor={CLR_DUTCH_WHITE}
          width={'100px'}
          padding="small"
          alignment="center middle"
        >
          <text color={CLR_WINE} size="small">
            {playerStat.K} / {playerStat.D} / {playerStat.A}
          </text>
        </hstack>

        <hstack
          grow
          backgroundColor={CLR_DUTCH_WHITE}
          width={'40px'}
          padding="small"
          alignment="center middle"
        >
          <text size="small">{playerStat.Diff_K_D}</text>
        </hstack>

        <hstack
          grow
          backgroundColor={CLR_DUTCH_WHITE}
          width={'50px'}
          padding="small"
          alignment="center middle"
        >
          <text color={CLR_WINE} size="small">
            {playerStat.HS}
          </text>
        </hstack>
      </hstack>
    </hstack>
  );
}

{
  /* {context.dimensions?.width! > 640 && (
        <hstack alignment="center middle" padding="small">
          <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
          <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
          <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
          <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
          <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
        </hstack>
      )} */
}

{
  /* {context.dimensions?.width! > 640 && (
          <>
            <spacer width={'2px'} />

            <hstack backgroundColor={CLR_DUTCH_WHITE} padding="small" alignment="center middle">
              <text color={CLR_WINE} size="small">
                91%
              </text>
            </hstack>

            <spacer width={'2px'} />

            <hstack backgroundColor={CLR_DUTCH_WHITE} padding="small" alignment="center middle">
              <text color={CLR_WINE} size="small">
                172
              </text>
            </hstack>

            <spacer width={'2px'} />

            <hstack backgroundColor={CLR_DUTCH_WHITE} padding="small" alignment="center middle">
              <text color={CLR_WINE} size="small">
                19%
              </text>
            </hstack>

            <spacer width={'2px'} />

            <hstack backgroundColor={CLR_DUTCH_WHITE} padding="small" alignment="center middle">
              <text color={CLR_WINE} size="small">
                0
              </text>
            </hstack>

            <spacer width={'1px'} />

            <hstack backgroundColor={CLR_DUTCH_WHITE} padding="small" alignment="center middle">
              <text color={CLR_WINE} size="small">
                1
              </text>
            </hstack>

            <spacer width={'1px'} />

            <hstack backgroundColor={CLR_DUTCH_WHITE} padding="small" alignment="center middle">
              <text color={CLR_WINE} size="small">
                -1
              </text>
            </hstack>
          </>
        )} */
}
