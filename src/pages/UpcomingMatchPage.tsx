import { Devvit, useAsync, useInterval } from '@devvit/public-api';
import {
  getUpcomingMatchDataFromRedis,
  postMatchPageTypeToRedis,
} from '../matches/fetchMatches.js';
import { MatchSegment, PageType } from '../core/types.js';
import { getTimeRemaining } from '../utils/timeRemaining.js';
import { ErrorState } from '../components/Error.js';

export const UpcomingMatchPage: Devvit.BlockComponent = async (_, context) => {
  const { redis, postId } = context;
  const { data: matchData } = useAsync(async () => {
    if (!postId) return null;
    const data = await getUpcomingMatchDataFromRedis(redis, postId);
    if (!data) return null;
    return JSON.parse(data) as MatchSegment;
  });

  if (!matchData) return <ErrorState />;

  const now = Date.now();
  const timeLeft = Math.max(new Date(matchData.unix_timestamp + 'UTC').getTime() - now, 0);
  const isCountdownActive = timeLeft > 0;

  const interval = useInterval(() => {}, 1000);

  if (isCountdownActive) {
    interval.start();
  } else {
    interval.stop();
    await postMatchPageTypeToRedis(redis, postId!, PageType.LIVE);
  }

  return (
    <vstack width={'100%'} height={'100%'} cornerRadius="medium" backgroundColor="red">
      <TopBar />
      <MainBar matchData={matchData} />
      <PlayerInfo />
    </vstack>
  );
};

export function TopBar(): JSX.Element {
  return (
    <hstack
      height="58px"
      padding="medium"
      backgroundColor="alienblue-700"
      alignment="center middle"
    >
      <vstack alignment="top start">
        <text color="white" style="heading" size="medium">
          Challengers League 2025 South Asia: Split 2
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

export function MainBar({ matchData }: { matchData: MatchSegment }): JSX.Element {
  return (
    <zstack width="100%" backgroundColor="green">
      <hstack width={'100%'} height={'100%'}>
        <hstack borderColor="yellow" alignment="middle center">
          <text color="yellow">team 1</text>
          <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
        </hstack>
        <vstack borderColor="yellow" grow alignment="middle center">
          <text color="yellow">
            {getTimeRemaining(matchData.unix_timestamp, 'America/New_York')}
          </text>
          <text color="yellow">___</text>
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

export function PlayerInfo(): JSX.Element {
  return (
    <zstack width="100%" backgroundColor="yellow">
      <hstack width={'100%'} height={'100%'}>
        <vstack alignment="middle center">
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
        </vstack>
        <vstack grow alignment="middle center">
          <text color="black">Head To Head</text>
          <text color="black">3-2</text>
        </vstack>
        <vstack alignment="middle center">
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
          <hstack>
            <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
            <text color="black">Player 1</text>
          </hstack>
        </vstack>
      </hstack>
    </zstack>
  );
}
