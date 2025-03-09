import { Devvit, Post } from '@devvit/public-api';
import { MatchSegment, PageType } from '../core/types.js';
import {
  fetchExistingMatchPost,
  postUpcomingMatchDataToRedis,
  postMatchPageTypeToRedis,
} from '../matches/fetchMatches.js';

export const UpcomingMatchesShowForm = Devvit.createForm(
  ({ upcoming_matches }) => {
    return {
      fields: [
        {
          type: 'select',
          name: 'match',
          label: 'Select Upcoming Match',
          required: true,
          options: upcoming_matches.data.segments.map((match: MatchSegment) => ({
            label: `${match.team1} VS ${match.team2}`,
            value: JSON.stringify(match),
          })),
        },
      ],
      title: 'Create Upcoming Valorant Match Post',
      description: 'Create Upcoming Valorant Match Post',
      acceptLabel: 'Create Post',
      cancelLabel: 'Cancel',
    };
  },

  async ({ values }, context) => {
    const upcomingMatchData = JSON.parse(values['match']) as MatchSegment;
    // Check for existing post for this match
    const matchKey = `${upcomingMatchData.team1}.${upcomingMatchData.team2}`;
    const match = await fetchExistingMatchPost(context.redis, matchKey);
    if (match) {
      context.ui.showToast({
        text: 'Post for this game already created.',
        appearance: 'neutral',
      });
    } else {
      await createMatchPost(context, upcomingMatchData);
    }
  }
);

async function createMatchPost(ctx: Devvit.Context, upcomingMatchData: MatchSegment) {
  const { reddit } = ctx;
  const currentSubreddit = await reddit.getCurrentSubreddit();
  try {
    const post: Post = await reddit.submitPost({
      preview: <LoadingState />,
      title: `${upcomingMatchData.team1} vs. ${upcomingMatchData.team2}`,
      subredditName: currentSubreddit.name,
    });

    ctx.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });

    await postUpcomingMatchDataToRedis(ctx.redis, post.id, upcomingMatchData);
    await postMatchPageTypeToRedis(ctx.redis, post.id, PageType.UPCOMING);

    ctx.ui.navigateTo(post.url);
  } catch (error) {
    console.error(error);
    ctx.ui.showToast({
      text: 'Something went wrong...',
      appearance: 'neutral',
    });
  }
}

function LoadingState(): JSX.Element {
  return (
    <zstack width={'100%'} height={'100%'} alignment="center middle">
      <vstack width={'100%'} height={'100%'} alignment="center middle">
        <image
          url="loading.gif"
          description="Loading ..."
          height={'140px'}
          width={'140px'}
          imageHeight={'240px'}
          imageWidth={'240px'}
        />
        <spacer size="small" />
        <text size="large" weight="bold">
          Scoreboard loading...
        </text>
      </vstack>
    </zstack>
  );
}
