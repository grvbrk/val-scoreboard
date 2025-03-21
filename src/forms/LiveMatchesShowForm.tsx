import { Devvit, Post } from '@devvit/public-api';
import { PageType } from '../core/types.js';
import { postMatchInfoToRedis, postMatchPageTypeToRedis } from '../matches/fetchMatches.js';
import { Preview } from 'src/components/Preview.js';

export const LiveMatchesShowForm = Devvit.createForm(
  ({ live_matches }) => {
    return {
      fields: [
        {
          type: 'select',
          name: 'match',
          label: 'Select Live Match',
          required: true,
          options: live_matches.data.segments.map(
            (match: { team1: string; team2: string; match_page: string }) => ({
              label: `${match.team1} VS ${match.team2}`,
              value: JSON.stringify(match),
            })
          ),
        },
      ],
      title: 'Create Live Valorant Match Post',
      description: 'Create Live Valorant Match Post',
      acceptLabel: 'Create Post',
      cancelLabel: 'Cancel',
    };
  },

  async ({ values }, context) => {
    const liveMatchInfo = JSON.parse(values['match']) as {
      team1: string;
      team2: string;
      match_page: string;
    };
    await createMatchPost(context, liveMatchInfo);
  }
);

async function createMatchPost(
  ctx: Devvit.Context,
  liveMatchInfo: {
    team1: string;
    team2: string;
    match_page: string;
  }
) {
  const { reddit } = ctx;
  const currentSubreddit = await reddit.getCurrentSubreddit();
  try {
    const post: Post = await reddit.submitPost({
      preview: <Preview />,
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
