import { Devvit, useAsync, useInterval } from '@devvit/public-api';
import {
  getUpcomingMatchDataFromRedis,
  postMatchPageTypeToRedis,
} from '../matches/fetchMatches.js';
import { MatchSegment, PageType } from '../core/types.js';
import { getTimeRemaining } from '../utils/timeRemaining.js';
import { ErrorState } from '../components/Error.js';
import { CLR_DUTCH_WHITE, CLR_WINE } from '../core/colors.js';

export const UpcomingMatchPage: Devvit.BlockComponent<{ mount: () => void }> = (props, context) => {
  const { mount } = props;
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
    // postMatchPageTypeToRedis(redis, postId!, PageType.LIVE);
  }

  return (
    <vstack width={'100%'} height={'100%'} cornerRadius="medium">
      <UpcomingPageTopBar />
      <UpcomingMatchInfo matchData={matchData} />
      <UpcomingMatchStats />
      <Predictions context={context} mount={mount} />
    </vstack>
  );
};

export function UpcomingPageTopBar(): JSX.Element {
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
          Challengers League 2025 South Asia: Split 2
        </text>
        <text color={CLR_WINE} style="body" size="small">
          Main Event: Week 1
        </text>
      </vstack>

      <spacer grow size="large" />

      <vstack grow alignment="end middle">
        <text color={CLR_WINE} style="body" size="small">
          Tuesday, March 4th
        </text>
        <text color={CLR_WINE} style="body" size="small">
          6:00 PM PST
        </text>
      </vstack>

      <spacer width={'10px'} />
    </hstack>
  );
}

export function UpcomingMatchInfo({ matchData }: { matchData: MatchSegment }): JSX.Element {
  return (
    <zstack width="100%" backgroundColor={CLR_WINE}>
      <hstack width={'100%'} height={'100%'} padding="medium">
        <hstack grow alignment="middle start">
          <text
            alignment="end middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            maxWidth={'50%'}
            width={'200px'}
            wrap
          >
            HellGuardians Esports Violet
          </text>
          <spacer size="medium" />
          <image url={'uefa-champions-acm.png'} imageHeight={64} imageWidth={64} />
        </hstack>
        <vstack grow alignment="middle center">
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {getTimeRemaining(matchData.unix_timestamp, 'America/New_York')}
          </text>
          <spacer size="small" />

          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            B03
          </text>
        </vstack>
        <hstack grow alignment="middle end">
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
            HellGuardians Esports Violet
          </text>
        </hstack>
      </hstack>
    </zstack>
  );
}

export function UpcomingMatchStats(): JSX.Element {
  return (
    <zstack width="100%" backgroundColor={CLR_WINE}>
      <hstack width={'100%'} alignment="middle center" padding="medium" gap="medium">
        <hstack grow alignment="start middle" gap="small">
          <vstack grow alignment="center middle" gap="medium">
            {Array.from({ length: 3 }).map(() => {
              return <Player />;
            })}
          </vstack>
          <vstack grow alignment="center middle" gap="medium">
            {Array.from({ length: 2 }).map(() => {
              return <Player />;
            })}
          </vstack>
        </hstack>

        <vstack grow alignment="middle center">
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
        </vstack>

        <hstack grow alignment="start middle" gap="small">
          <vstack grow alignment="center middle" gap="medium">
            {Array.from({ length: 2 }).map(() => {
              return <Player />;
            })}
          </vstack>
          <vstack grow alignment="center middle" gap="medium">
            {Array.from({ length: 3 }).map(() => {
              return <Player />;
            })}
          </vstack>
        </hstack>
      </hstack>
    </zstack>
  );
}

export function Player(): JSX.Element {
  return (
    <hstack grow alignment="start middle">
      <image url={'uefa-champions-acm.png'} imageHeight={25} imageWidth={25} />
      <vstack grow padding="small">
        <text color={CLR_DUTCH_WHITE} size="medium" overflow="ellipsis">
          koldamenta
        </text>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          HEV
        </text>
      </vstack>
    </hstack>
  );
}

export function Predictions({
  context,
  mount,
}: {
  context: Devvit.Context;
  mount: () => void;
}): JSX.Element {
  return (
    <vstack backgroundColor={CLR_WINE} grow alignment="center middle">
      <spacer width={'20px'} />
      <hstack alignment="center middle" gap="medium">
        <hstack
          cornerRadius="large"
          backgroundColor={CLR_DUTCH_WHITE}
          padding="medium"
          alignment="center middle"
          gap="small"
          onPress={mount}
        >
          <text selectable={false} size="medium" color={CLR_WINE} weight="bold">
            Submit Predictions
          </text>
          <icon size="small" color={CLR_WINE} name="send-outline"></icon>
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
