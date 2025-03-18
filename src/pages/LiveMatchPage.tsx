import { Devvit, StateSetter, useAsync, useState } from '@devvit/public-api';
import { ErrorState } from '../components/Error.js';
import { liveMatchData, singleUpcomingMatchData } from 'src/core/data.js';
import { LiveMatchSegment, LiveMatchType } from 'src/core/types.js';
import { getMatchInfoFromRedis } from 'src/matches/fetchMatches.js';
import { CLR_DUTCH_WHITE, CLR_WINE } from 'src/core/colors.js';

export const LiveMatchPage: Devvit.BlockComponent = (_, context) => {
  const { redis, postId, cache, userId, ui, settings } = context;

  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const {
    data: matchData,
    loading,
    error,
  } = useAsync(async () => {
    if (!postId || !userId) return null;

    return liveMatchData;
    // const matchInfoStr = await getMatchInfoFromRedis(redis, postId);
    // if (!matchInfoStr) return null;
    // const { match_page } = JSON.parse(matchInfoStr) as {
    //   team1: string;
    //   team2: string;
    //   match_page: string;
    // };

    // const VALBOARD_URL = await settings.get('VALBOARD_URL');
    // const url = `https://${VALBOARD_URL}/match/live?url=${match_page}`;

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
    //       return (await response.json()) as LiveMatchType;
    //     } catch (error) {
    //       ui.showToast({
    //         text: 'Something went wrong...',
    //         appearance: 'neutral',
    //       });
    //       return liveMatchData;
    //     }
    //   },
    //   {
    //     key: `${postId}${userId}`,
    //     ttl: 60000, // 1 min
    //   }
    // );
  });

  if (!matchData || loading || error) return <ErrorState />;

  return (
    <vstack width={'100%'} height={'100%'} cornerRadius="medium" backgroundColor={CLR_WINE}>
      <LivePageTopBar matchData={matchData.data.segments[0]} />
      <LiveMatchInfo matchData={matchData.data.segments[0]} />

      <vstack width="100%" alignment="center middle">
        <text
          alignment="center middle"
          color={CLR_DUTCH_WHITE}
          style="metadata"
          size="small"
          maxWidth={'70%'}
          wrap
        >
          GX.GC ban Fracture; SK.N ban Ascent; GX.GC pick Pearl; SK.N pick Lotus; GX.GC ban Haven;
          SK.N ban Split; Icebox remains
        </text>
      </vstack>
      <spacer size="medium" />
      <OptionsBar
        matchData={matchData.data.segments[0]}
        selectedTabIndex={selectedTabIndex}
        setSelectedTabIndex={setSelectedTabIndex}
      />
      <LiveMatchStats matchData={matchData.data.segments[0]} selectedTabIndex={selectedTabIndex} />
    </vstack>
  );
};

function LivePageTopBar({ matchData }: { matchData: LiveMatchSegment }): JSX.Element {
  return (
    <hstack
      height="58px"
      padding="small"
      backgroundColor={CLR_DUTCH_WHITE}
      alignment="start middle"
    >
      <spacer width={'10px'} />
      <vstack grow alignment="start middle">
        <text color={CLR_WINE} style="heading" size="medium" wrap>
          {matchData.match_series}
        </text>
        <text color={CLR_WINE} style="body" size="small">
          {matchData.match_event}
        </text>
      </vstack>

      <spacer grow size="large" />

      <vstack grow alignment="end middle">
        <text color={'#ff0000'} weight="bold" style="metadata" size="medium">
          • LIVE
        </text>
        <hstack alignment="center middle">
          <icon size="xsmall" color={CLR_WINE} name="link-outline" />
          <text color={CLR_WINE} style="body" size="small">
            vlr.gg
          </text>
        </hstack>
      </vstack>

      <spacer width={'10px'} />
    </hstack>
  );
}

function LiveMatchInfo({ matchData }: { matchData: LiveMatchSegment }): JSX.Element {
  return (
    <zstack width="100%" backgroundColor={CLR_WINE}>
      <hstack width={'100%'} height={'100%'} padding="medium">
        <hstack grow alignment="middle start" maxWidth={'50%'} minWidth={'40%'}>
          <spacer size="medium" />
          <text
            maxWidth={'50%'}
            minWidth={'40%'}
            alignment="end middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            overflow="ellipsis"
            wrap
          >
            {matchData.team1}
          </text>
          <spacer size="medium" />
          <image url={'aura.png'} imageHeight={64} imageWidth={64} />
        </hstack>
        <hstack grow alignment="middle center">
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {matchData.team1_score}
          </text>
          <spacer size="small" />
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            :
          </text>
          <spacer size="small" />
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {matchData.team2_score}
          </text>
        </hstack>
        <hstack grow alignment="middle end" maxWidth={'50%'} minWidth={'40%'}>
          <image url={'ge.png'} imageHeight={64} imageWidth={64} />
          <spacer size="medium" />
          <text
            alignment="start middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            maxWidth={'50%'}
            minWidth={'40%'}
            wrap
          >
            {matchData.team2}
          </text>
          <spacer size="medium" />
        </hstack>
      </hstack>
    </zstack>
  );
}

function OptionsBar({
  matchData,
  selectedTabIndex,
  setSelectedTabIndex,
}: {
  matchData: LiveMatchSegment;
  selectedTabIndex: number;
  setSelectedTabIndex: StateSetter<number>;
}): JSX.Element {
  return (
    <hstack width={'100%'} alignment="start middle">
      <spacer grow size="medium" />
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
                <text selectable={false} size="small" color={isActive ? CLR_WINE : CLR_DUTCH_WHITE}>
                  {r.map_name ?? 'All'}
                </text>
              </zstack>
              <spacer grow width="10px" />
            </>
          );
        })}
      </hstack>
      <spacer grow size="medium" />
    </hstack>
  );
}

function LiveMatchStats({
  matchData,
  selectedTabIndex,
}: {
  matchData: LiveMatchSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const roundInfo = matchData.rounds[selectedTabIndex];

  return (
    <vstack grow width="100%" height="100%" backgroundColor={CLR_WINE}>
      <hstack width="100%" height="100%" alignment="middle center" padding="medium" gap="small">
        <spacer grow size="medium" />

        {/* Team 1 */}
        <vstack grow alignment="center middle">
          <text color={CLR_DUTCH_WHITE} size="xxlarge" weight="bold">
            {roundInfo.team1_round_score}
          </text>
        </vstack>
        <spacer grow size="medium" />
        {/* Team 2 */}
        <vstack grow alignment="center middle">
          <text color={CLR_DUTCH_WHITE} size="xxlarge" weight="bold">
            {roundInfo.team2_round_score}
          </text>
        </vstack>
        <spacer grow size="medium" />
      </hstack>
      <spacer grow size="large" />
    </vstack>
  );
}
