import { Devvit, useState } from '@devvit/public-api';
import { UpcomingMatchesShowForm } from './forms/UpcomingMatchesShowForm.js';
import { LiveMatchPage } from './pages/LiveMatchPage.js';
import { MatchResultsPage } from './pages/MatchResultsPage.js';
import {
  AllLiveMatchesData,
  AllMatchResults,
  AllUpcomingMatchesData,
  PageType,
} from './core/types.js';
import { getMatchPageTypeFromRedis } from './redis/matches.js';
import { UpcomingMatchPage } from './pages/UpcomingMatchPage.js';
import { LiveMatchesShowForm } from './forms/LiveMatchesShowForm.js';
import { MatchResultsShowForm } from './forms/MatchResultsShowForm.js';

Devvit.addSettings([
  {
    name: 'VALBOARD_URL',
    label: 'VALBOARD_URL',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
]);

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
  realtime: true,
  media: true,
});

Devvit.addMenuItem({
  label: '(VALORANT) Create Upcoming Match Post',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui, cache, userId, settings, postId }) => {
    const VALBOARD_URL = await settings.get('VALBOARD_URL');
    const url = `${VALBOARD_URL}/match/upcoming/all`;

    const result = await cache(
      async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            ui.showToast({
              text: 'Error getting response, please try again.',
              appearance: 'neutral',
            });
            throw Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          return (await response.json()) as AllUpcomingMatchesData;
        } catch (error) {
          console.error(error);
          ui.showToast({
            text: 'Something went wrong...',
            appearance: 'neutral',
          });
          return null;
        }
      },
      {
        key: `${postId}${userId}`,
        ttl: 60000, // 1 min
      }
    );

    return ui.showForm(UpcomingMatchesShowForm, { upcoming_matches: result });
  },
});

Devvit.addMenuItem({
  label: '(VALORANT) Create Live Match Post',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui, cache, userId, settings, postId }) => {
    const VALBOARD_URL = await settings.get('VALBOARD_URL');
    const url = `${VALBOARD_URL}/match/live/all`;

    const result = await cache(
      async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            ui.showToast({
              text: 'Error getting response, please try again.',
              appearance: 'neutral',
            });
            throw Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          return (await response.json()) as AllLiveMatchesData;
        } catch (error) {
          console.error(error);
          ui.showToast({
            text: 'Something went wrong...',
            appearance: 'neutral',
          });
          return null;
        }
      },
      {
        key: `${postId}${userId}`,
        ttl: 60000, // 1 min
      }
    );

    if (!result || result.data.status != 200 || result.data.segments.length === 0) {
      ui.showToast({
        text: "There's no live matches currently",
        appearance: 'neutral',
      });
      return;
    }

    return ui.showForm(LiveMatchesShowForm, { live_matches: result });
  },
});

Devvit.addMenuItem({
  label: '(VALORANT) Create Match Results Post',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui, cache, userId, settings, postId }) => {
    const VALBOARD_URL = await settings.get('VALBOARD_URL');
    const url = `${VALBOARD_URL}/match/results/all`;

    const result = await cache(
      async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            ui.showToast({
              text: 'Error getting response, please try again.',
              appearance: 'neutral',
            });
            throw Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          return (await response.json()) as AllMatchResults;
        } catch (error) {
          console.error(error);
          ui.showToast({
            text: 'Something went wrong...',
            appearance: 'neutral',
          });
          return null;
        }
      },
      {
        key: `${postId}${userId}`,
        ttl: 60000, // 1 min
      }
    );

    return ui.showForm(MatchResultsShowForm, { match_results: result });
  },
});

Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    const { redis, postId } = context;
    const [page, setPage] = useState<string | null>(async () => {
      if (!postId) return null;
      const pageType = await getMatchPageTypeFromRedis(redis, postId);
      if (!pageType) return null;
      return pageType;
    });

    return (
      <blocks height="regular">
        {(() => {
          switch (page) {
            case PageType.UPCOMING:
              return <UpcomingMatchPage setPage={setPage} />;
            case PageType.LIVE:
              return <LiveMatchPage setPage={setPage} />;
            case PageType.RESULTS:
              return <MatchResultsPage />;
          }
        })()}
      </blocks>
    );
  },
});

export default Devvit;

// Devvit.addMenuItem({
//   label: '(DEV) Clear all redis keys',
//   location: 'subreddit',
//   forUserType: `moderator`,
//   onPress: async (_event, { ui, redis }) => {
//     try {
//       await redis.hDel(
//         REDIS_MATCH_TYPE,
//         REDIS_UPCOMING_MATCH_INFO,
//         REDIS_LIVE_MATCH_INFO,
//         REDIS_MATCH_RESULTS_INFO
//       );
//       ui.showToast({
//         text: 'Successfully deleted',
//         appearance: 'success',
//       });
//     } catch (error) {
//       ui.showToast({
//         text: 'Something went wrong while deleting...',
//         appearance: 'neutral',
//       });
//     }
//   },
// });
