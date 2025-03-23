import { Devvit, Post } from '@devvit/public-api';
import { AllLiveMatchSegment, PageType } from '../core/types.js';
import { postMatchInfoToRedis, postMatchPageTypeToRedis } from '../redis/matches.js';
import { LivePreview } from 'src/components/LivePreview.js';

export const LiveMatchesShowForm = Devvit.createForm(
  ({ live_matches }) => {
    return {
      fields: [
        {
          type: 'select',
          name: 'match',
          label: 'Select Live Match',
          required: true,
          options: live_matches.data.segments.map((match: AllLiveMatchSegment) => ({
            label: `${match.team1} VS ${match.team2}`,
            value: JSON.stringify(match),
          })),
        },
      ],
      title: 'Create Live Valorant Match Post',
      description: 'Create Live Valorant Match Post',
      acceptLabel: 'Create Post',
      cancelLabel: 'Cancel',
    };
  },

  async ({ values }, context) => {
    const liveMatchInfo = JSON.parse(values['match']) as AllLiveMatchSegment;
    await createMatchPost(context, liveMatchInfo);
  }
);

async function createMatchPost(ctx: Devvit.Context, liveMatchInfo: AllLiveMatchSegment) {
  const { reddit } = ctx;
  const currentSubreddit = await reddit.getCurrentSubreddit();
  try {
    const post: Post = await reddit.submitPost({
      preview: <LivePreview upcomingMatchInfo={liveMatchInfo} />,
      title: `${liveMatchInfo.team1} vs. ${liveMatchInfo.team2}`,
      subredditName: currentSubreddit.name,
    });

    ctx.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });

    await postMatchInfoToRedis(ctx.redis, post.id, liveMatchInfo);
    await postMatchPageTypeToRedis(ctx.redis, post.id, PageType.LIVE);

    ctx.ui.navigateTo(post.url);
  } catch (error) {
    console.error(error);
    ctx.ui.showToast({
      text: 'Something went wrong...',
      appearance: 'neutral',
    });
  }
}
