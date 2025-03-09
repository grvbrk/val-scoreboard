import { Devvit, useAsync, useState, useWebView } from '@devvit/public-api';
import { DEVVIT_SETTINGS_KEYS } from './utils/constants.js';
import { UpcomingMatchPage } from './pages/UpcomingMatchPage.js';
import { upcoming_matches, live_match, match_results } from './core/data.js';
import { UpcomingMatchesShowForm } from './forms/UpcomingMatchesShowForm.js';
import { LiveMatchPage } from './pages/LiveMatchPage.js';
import { MatchResultsPage } from './pages/MatchResultsPage.js';
import { PageType } from './core/types.js';
import {
  REDIS_LIVE_MATCH_DATA,
  REDIS_MATCH_RESULTS_DATA,
  REDIS_MATCH_TYPE,
  REDIS_UPCOMING_MATCH_DATA,
} from './utils/redis.js';
import { getMatchTypeFromRedis } from './matches/fetchMatches.js';

Devvit.addSettings([
  {
    name: DEVVIT_SETTINGS_KEYS.SECRET_API_KEY,
    label: 'API Key for secret things',
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
});

Devvit.addMenuItem({
  label: '(VALORANT) Create Upcoming Match Post',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui, redis }) => {
    const url = 'https://upcoming-match-url.com';
    return ui.showForm(UpcomingMatchesShowForm, { upcoming_matches: upcoming_matches });

    // try {
    //   const matchData = await fetch(url); // upcoming_matches
    //   return ui.showForm(valScoreBoardShowForm, upcoming_matches);
    // } catch (error) {
    //   console.log(error);
    //   ui.showToast({
    //     text: 'Something went wrong...',
    //     appearance: 'neutral',
    //   });
    // }
  },
});

Devvit.addMenuItem({
  label: '(VALORANT) Create Live Match Post',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    const url = 'https://live-match-url.com';
    try {
      const matchData = await fetch(url); // live_match
      return ui.showForm(UpcomingMatchesShowForm, live_match);
    } catch (error) {
      console.log(error);
      ui.showToast({
        text: 'Something went wrong...',
        appearance: 'neutral',
      });
    }
  },
});

Devvit.addMenuItem({
  label: '(VALORANT) Create Match Results Post',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    const url = 'https://match-results-url.com';
    try {
      const matchData = await fetch(url); // match_results
      return ui.showForm(UpcomingMatchesShowForm, match_results);
    } catch (error) {
      console.log(error);
      ui.showToast({
        text: 'Something went wrong...',
        appearance: 'neutral',
      });
    }
  },
});

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    const { redis, postId } = context;
    const { data: page } = useAsync(async () => {
      if (postId) {
        const pageType = await getMatchTypeFromRedis(redis, postId);
        if (!pageType) return null;
        return pageType;
      }
      return null;
    });

    return (
      <blocks height="regular">
        {(() => {
          switch (page) {
            case PageType.UPCOMING:
              return <UpcomingMatchPage />;
            case PageType.LIVE:
              return <LiveMatchPage />;
            default:
              return <MatchResultsPage />;
          }
        })()}
      </blocks>
    );
  },
});

export default Devvit;

Devvit.addMenuItem({
  label: '(DEV) Clear all redis keys',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui, redis }) => {
    try {
      await redis.del(
        REDIS_MATCH_TYPE,
        REDIS_UPCOMING_MATCH_DATA,
        REDIS_LIVE_MATCH_DATA,
        REDIS_MATCH_RESULTS_DATA
      );
      ui.showToast({
        text: 'Successfully deleted',
        appearance: 'success',
      });
    } catch (error) {
      ui.showToast({
        text: 'Something went wrong while deleting...',
        appearance: 'neutral',
      });
    }
  },
});

{
  /* <button
          onPress={() => {
            mount();
          }}
        >
          Launch
        </button> */
}

// const { mount } = useWebView<WebviewToBlockMessage, BlocksToWebviewMessage>({
//   onMessage: async (event, { postMessage }) => {
//     console.log('Received message', event);
//     const data = event as unknown as WebviewToBlockMessage;

//     switch (data.type) {
//       case 'INIT':
//         postMessage({
//           type: 'INIT_RESPONSE',
//           payload: {
//             postId: context.postId!,
//           },
//         });
//         break;
//       case 'GET_POKEMON_REQUEST':
//         context.ui.showToast({ text: `Received message: ${JSON.stringify(data)}` });
//         const pokemon = await getPokemonByName(data.payload.name);

//         postMessage({
//           type: 'GET_POKEMON_RESPONSE',
//           payload: {
//             name: pokemon.name,
//             number: pokemon.id,
//             // Note that we don't allow outside images on Reddit if
//             // wanted to get the sprite. Please reach out to support
//             // if you need this for your app!
//           },
//         });
//         break;

//       default:
//         console.error('Unknown message type', data satisfies never);
//         break;
//     }
//   },
// });
