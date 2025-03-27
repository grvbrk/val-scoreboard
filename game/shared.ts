import { PredictionType, SingleUpcomingMatchSegment } from '../src/core/types';

export type Page = 'prediction' | 'results';

export type WebviewToBlockMessage =
  | { type: 'INIT' }
  | {
      type: 'SEND_USER_PREDS';
      payload: PredictionType;
    };

export type BlocksToWebviewMessage =
  | {
      type: 'INIT_RESPONSE';
      payload: {
        postId: string;
        matchData: SingleUpcomingMatchSegment;
        userPreds: PredictionType | null;
      };
    }
  | {
      type: 'GET_POKEMON_RESPONSE';
      payload: { number: number; name: string; error?: string };
    };

export type DevvitMessage = {
  type: 'devvit-message';
  data: { message: BlocksToWebviewMessage };
};
