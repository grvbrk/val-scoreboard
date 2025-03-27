import { Page } from './shared';
import { usePage } from './hooks/usePage';
import { useEffect, useState } from 'react';
import { sendToDevvit } from './utils';
import { useDevvitListener } from './hooks/useDevvitListener';
import { PredictionPage } from './pages/PredictionPage';
import { ResultsPage } from './pages/ResultsPage';
import { PredictionType, SingleUpcomingMatchSegment } from '../src/core/types';
import { singleUpcomingMatchData } from '../src/core/data';

const getPage = (
  page: Page,
  {
    postId,
    upcomingMatchData,
    userPreds,
  }: {
    postId: string;
    upcomingMatchData: SingleUpcomingMatchSegment;
    userPreds: PredictionType | null;
  }
) => {
  switch (page) {
    case 'prediction':
      return (
        <PredictionPage
          postId={postId}
          upcomingMatchData={upcomingMatchData}
          userPreds={userPreds}
        />
      );
    case 'results':
      return <ResultsPage />;
    default:
      throw new Error(`Unknown page: ${page satisfies never}`);
  }
};

export const App = () => {
  const [postId, setPostId] = useState<string>('');
  const [upcomingMatchData, setUpcomingMatchData] = useState<SingleUpcomingMatchSegment>();
  // singleUpcomingMatchData.data.segments[0]

  const [userPreds, setUserPreds] = useState<PredictionType | null>(null);

  const page = usePage();
  const initData = useDevvitListener('INIT_RESPONSE');
  useEffect(() => {
    sendToDevvit({ type: 'INIT' });
  }, []);

  useEffect(() => {
    if (initData) {
      setPostId(initData.postId);
      setUpcomingMatchData(initData.matchData);
      setUserPreds(initData.userPreds);
    }
  }, [initData, setPostId]);

  return (
    <div className="min-h-full bg-gradient-to-br from-neutral-900 via-neutral-900 to-red-800">
      {upcomingMatchData ? (
        getPage(page, { postId, upcomingMatchData, userPreds })
      ) : (
        <div className="mb-8 flex h-screen flex-col items-center justify-center">
          <h1 className="mb-4 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-center text-5xl font-bold text-transparent">
            VALORANT SUPERTEAM
          </h1>
          <div className="mx-auto mb-4 h-1 w-40 bg-gradient-to-r from-red-500 to-red-600"></div>
          <p className="mx-auto mb-10 max-w-2xl text-center text-neutral-400">
            Loading match data...
          </p>
        </div>
      )}
    </div>
  );
};
