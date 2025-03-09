import { Devvit, useAsync } from '@devvit/public-api';
import { LiveMatchType, MatchSegment } from '../core/types.js';
import { ErrorState } from '../components/Error.js';
import { getUpcomingMatchDataFromRedis } from '../matches/fetchMatches.js';

export const LiveMatchPage: Devvit.BlockComponent = async (_, context) => {
  const { redis, postId } = context;
  const url = 'https://live-match-url.com';

  const { data: upcomingMatchData } = useAsync(async () => {
    if (postId) {
      const data = await getUpcomingMatchDataFromRedis(redis, postId);
      if (!data) return null;
      return JSON.parse(data) as MatchSegment;
    }
    return null;
  });

  const {
    data: liveMatchStatus,
    loading,
    error,
  } = useAsync(async () => {
    return context.cache(
      async () => {
        const response = await fetch(url);
        const liveMatchData = (await response.json()) as LiveMatchType;
        const liveMatchesArr = liveMatchData.data.segments;
        if (liveMatchesArr.length === 0) {
          // Go to results page
          return null;
        }
        const liveMatchStatus = liveMatchesArr.find((match) => {
          match.match_event === upcomingMatchData?.match_event;
        });

        if (!liveMatchStatus) return null;

        return liveMatchStatus;
      },
      {
        key: `live_match_data`,
        ttl: 90 * 1000, // 90 seconds
      }
    );
  });

  if (!liveMatchStatus || loading || error) return <ErrorState />;

  return (
    <blocks height="regular">
      <vstack width={'100%'} height={'100%'} cornerRadius="medium" backgroundColor="red">
        <TopBar liveMatchStatus={liveMatchStatus} />
        <MainBar liveMatchStatus={liveMatchStatus} />
        <MatchInfo liveMatchStatus={liveMatchStatus} context={context} />
      </vstack>
    </blocks>
  );
};

export function TopBar({ liveMatchStatus }: { liveMatchStatus: MatchSegment }): JSX.Element {
  return (
    <hstack
      height="58px"
      padding="medium"
      backgroundColor="alienblue-700"
      alignment="center middle"
    >
      <vstack alignment="top start">
        <text color="white" style="heading" size="medium">
          Match results Page
        </text>
        <text color="white" style="body" size="small">
          Main Event: Week 1
        </text>
      </vstack>
      <vstack grow />
      <vstack alignment="middle end">
        <text color="white" style="body" size="small">
          Tuesday, March 4th
        </text>
        <text color="white" style="body" size="small">
          6:00 PM PST
        </text>
      </vstack>
    </hstack>
  );
}

export function MainBar({ liveMatchStatus }: { liveMatchStatus: MatchSegment }): JSX.Element {
  return (
    <zstack width="100%" backgroundColor="green">
      <hstack width={'100%'} height={'100%'}>
        <hstack borderColor="yellow" alignment="middle center">
          <text color="yellow">team 1</text>
          <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
        </hstack>
        <vstack borderColor="yellow" grow alignment="middle center">
          <text color="yellow">Final</text>
          <text color="yellow">2 : 0</text>
          <text color="yellow">B03</text>
        </vstack>
        <hstack borderColor="yellow" alignment="middle center">
          <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
          <text color="yellow">team 2</text>
        </hstack>
      </hstack>
    </zstack>
  );
}

export function MatchInfo({
  context,
  liveMatchStatus,
}: {
  context: Devvit.Context;
  liveMatchStatus: MatchSegment;
}): JSX.Element {
  return (
    <zstack width="100%" backgroundColor="yellow">
      <hstack width={'100%'} height={'100%'} alignment="middle center">
        <vstack>
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
        </vstack>
        <spacer size="medium" />
        <vstack>
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
          <PlayerInfo context={context} liveMatchStatus={liveMatchStatus} />
        </vstack>
      </hstack>
    </zstack>
  );
}

export function PlayerInfo({
  context,
  liveMatchStatus,
}: {
  context: Devvit.Context;
  liveMatchStatus: MatchSegment;
}): JSX.Element {
  return (
    <hstack padding="small" borderColor="red">
      <hstack borderColor="red">
        <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
        <text>Spaz</text>
      </hstack>
      <hstack borderColor="red">
        <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
        <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
        <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
      </hstack>
      <hstack padding="small" borderColor="red">
        <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
          <text size="xsmall">1.77</text>
        </hstack>

        <spacer width={'2px'} />

        <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
          <text size="xsmall">273</text>
        </hstack>

        <spacer width={'2px'} />

        <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
          <text size="xsmall">43 / 20 / 32</text>
        </hstack>

        <spacer width={'2px'} />

        <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
          <text size="xsmall">+23</text>
        </hstack>

        {(context.dimensions?.width ?? 360) > 400 && (
          <>
            <spacer width={'2px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">91%</text>
            </hstack>

            <spacer width={'2px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">172</text>
            </hstack>

            <spacer width={'2px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">19%</text>
            </hstack>

            <spacer width={'2px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">0</text>
            </hstack>

            <spacer width={'1px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">1</text>
            </hstack>

            <spacer width={'1px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">-1</text>
            </hstack>
          </>
        )}
      </hstack>
    </hstack>
  );
}
