import { Devvit, Post } from '@devvit/public-api';
import { PageType } from '../core/types.js';
import { postMatchInfoToRedis, postMatchPageTypeToRedis } from '../matches/fetchMatches.js';
import { Preview } from 'src/components/Preview.js';

export const MatchResultsShowForm = Devvit.createForm(
  ({ match_results }) => {
    return {
      fields: [
        {
          type: 'select',
          name: 'match',
          label: 'Select Match Results',
          required: true,
          options: match_results.data.segments.map(
            (match: { team1: string; team2: string; match_page: string }) => ({
              label: `${match.team1} VS ${match.team2}`,
              value: JSON.stringify(match),
            })
          ),
        },
      ],
      title: 'Create Valorant Match Results Post',
      description: 'Create Valorant Match Results Post',
      acceptLabel: 'Create Post',
      cancelLabel: 'Cancel',
    };
  },

  async ({ values }, context) => {
    const matchResultInfo = JSON.parse(values['match']) as {
      team1: string;
      team2: string;
      match_page: string;
    };
    await createMatchPost(context, matchResultInfo);
  }
);

async function createMatchPost(
  ctx: Devvit.Context,
  matchResultInfo: {
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
      title: `${matchResultInfo.team1} vs. ${matchResultInfo.team2}`,
      subredditName: currentSubreddit.name,
    });

    ctx.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });

    await postMatchInfoToRedis(ctx.redis, post.id, matchResultInfo);
    await postMatchPageTypeToRedis(ctx.redis, post.id, PageType.RESULTS);

    ctx.ui.navigateTo(post.url);
  } catch (error) {
    console.error(error);
    ctx.ui.showToast({
      text: 'Something went wrong...',
      appearance: 'neutral',
    });
  }
}
