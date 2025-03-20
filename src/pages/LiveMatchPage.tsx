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
      {context.dimensions?.width! > 400 ? (
        <LivePageTopBar matchData={matchData.data.segments[0]} />
      ) : (
        <LivePageTopBarMobile matchData={matchData.data.segments[0]} />
      )}

      {context.dimensions?.width! > 400 ? (
        <LiveMatchInfo matchData={matchData.data.segments[0]} />
      ) : (
        <LiveMatchInfoMobile matchData={matchData.data.segments[0]} />
      )}

      <vstack width="100%" alignment="center middle">
        <text alignment="center middle" color={CLR_DUTCH_WHITE} size={`xsmall`} width={80} wrap>
          GX.GC ban Fracture; SK.N ban Ascent; GX.GC pick Pearl; SK.N pick Lotus; GX.GC ban Haven;
          SK.N ban Split; Icebox remains
        </text>
      </vstack>
      <spacer size="large" />

      {context.dimensions?.width! > 400 ? (
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

      <LiveMatchStats matchData={matchData.data.segments[0]} selectedTabIndex={selectedTabIndex} />
    </vstack>
  );
};

function LivePageTopBar({ matchData }: { matchData: LiveMatchSegment }): JSX.Element {
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
        <text color={'#ff0000'} style="body" size="small">
          • LIVE
        </text>
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

function LivePageTopBarMobile({ matchData }: { matchData: LiveMatchSegment }): JSX.Element {
  const { match_event, match_series } = matchData;
  return (
    <hstack padding="small" backgroundColor={CLR_DUTCH_WHITE} alignment="start middle">
      <image url={'event.png'} imageHeight={32} imageWidth={32} />
      <spacer size="small" />
      <vstack grow alignment="start middle" width={50}>
        <text color={CLR_WINE} weight="bold" size="medium" wrap>
          {match_series}
        </text>
        <text color={CLR_WINE} size="xsmall">
          {match_event}
          mobile
        </text>
      </vstack>

      <spacer grow size="medium" />

      <vstack grow alignment="start middle" maxWidth={40}>
        <text color={'#ff0000'} size="xsmall">
          • LIVE
        </text>
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

function LiveMatchInfo({ matchData }: { matchData: LiveMatchSegment }): JSX.Element {
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

function LiveMatchInfoMobile({ matchData }: { matchData: LiveMatchSegment }): JSX.Element {
  const { team1, team2, team1_score, team2_score } = matchData;
  return (
    <zstack width="100%">
      <hstack width={'100%'} height={'100%'} padding="medium">
        <vstack grow alignment="center middle" width={40}>
          <hstack grow alignment="center middle">
            <image url={'aura.png'} imageHeight={64} imageWidth={64} />
          </hstack>
          <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
            {team1}
          </text>
        </vstack>

        <hstack grow alignment="middle center" width={20}>
          <text color={CLR_DUTCH_WHITE} size="xsmall">
            {team1_score}
          </text>
          <spacer size="small" />
          <text color={CLR_DUTCH_WHITE} size="xsmall">
            :
          </text>
          <spacer size="small" />
          <text color={CLR_DUTCH_WHITE} size="xsmall">
            {team2_score}
          </text>
        </hstack>

        <vstack grow alignment="center middle" width={40}>
          <hstack grow alignment="center middle">
            <image url={'ge.png'} imageHeight={64} imageWidth={64} />
          </hstack>
          <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
            {team2}
          </text>
        </vstack>
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
  matchData: LiveMatchSegment;
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
