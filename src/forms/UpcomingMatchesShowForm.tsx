import { Devvit, Post } from '@devvit/public-api';
import { AllUpcomingMatchSegment, PageType } from '../core/types.js';
import { postMatchInfoToRedis, postMatchPageTypeToRedis } from '../redis/matches.js';
import { UpcomingPreview, UpcomingPreviewMobile } from 'src/components/UpcomingPreview.js';
import { getTimeRemaining } from 'src/utils/timeRemaining.js';

export const UpcomingMatchesShowForm = Devvit.createForm(
  ({ upcoming_matches }) => {
    return {
      fields: [
        {
          type: 'select',
          name: 'match',
          label: 'Select Upcoming Match',
          required: true,
          options: upcoming_matches.data.segments.map((match: AllUpcomingMatchSegment) => ({
            label: `${match.team1} VS ${match.team2} | ${getTimeRemaining(match.unix_timestamp).timeLeft}`,
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
    const upcomingMatchInfo = JSON.parse(values['match']) as AllUpcomingMatchSegment;
    await createMatchPost(context, upcomingMatchInfo);
  }
);

async function createMatchPost(ctx: Devvit.Context, upcomingMatchInfo: AllUpcomingMatchSegment) {
  const { reddit, dimensions } = ctx;
  try {
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const post: Post = await reddit.submitPost({
      preview:
        dimensions?.width! > 400 ? (
          <UpcomingPreview upcomingMatchInfo={upcomingMatchInfo} />
        ) : (
          <UpcomingPreviewMobile upcomingMatchInfo={upcomingMatchInfo} />
        ),
      title: `${upcomingMatchInfo.team1} vs. ${upcomingMatchInfo.team2}`,
      subredditName: currentSubreddit.name,
    });

    ctx.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });

    await postMatchInfoToRedis(ctx.redis, post.id, upcomingMatchInfo);
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
