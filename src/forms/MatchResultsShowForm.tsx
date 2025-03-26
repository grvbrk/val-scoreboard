import { Devvit, Post } from '@devvit/public-api';
import { AllMatchResultSegment, PageType } from '../core/types.js';
import { postMatchInfoToRedis, postMatchPageTypeToRedis } from '../redis/matches.js';
import { ResultsPreview, ResultsPreviewMobile } from 'src/components/ResultsPreview.js';

export const MatchResultsShowForm = Devvit.createForm(
  ({ match_results }) => {
    return {
      fields: [
        {
          type: 'select',
          name: 'match',
          label: 'Select Match Results',
          required: true,
          options: match_results.data.segments.map((match: AllMatchResultSegment) => ({
            label: `${match.team1}  ${match.score1} vs. ${match.team2}  ${match.score2}`,
            value: JSON.stringify(match),
          })),
        },
      ],
      title: 'Create Valorant Match Results Post',
      description: 'Create Valorant Match Results Post',
      acceptLabel: 'Create Post',
      cancelLabel: 'Cancel',
    };
  },

  async ({ values }, context) => {
    const matchResultInfo = JSON.parse(values['match']) as AllMatchResultSegment;
    await createMatchPost(context, matchResultInfo);
  }
);

async function createMatchPost(ctx: Devvit.Context, matchResultInfo: AllMatchResultSegment) {
  const { reddit, dimensions } = ctx;
  try {
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const post: Post = await reddit.submitPost({
      preview:
        dimensions?.width! > 400 ? (
          <ResultsPreview upcomingMatchInfo={matchResultInfo} />
        ) : (
          <ResultsPreviewMobile upcomingMatchInfo={matchResultInfo} />
        ),
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
