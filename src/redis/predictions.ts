import { RedisClient } from '@devvit/public-api';
import { PredictionType } from 'src/core/types.js';
import { REDIS_USER_PREDICTION } from 'src/utils/redisKeys.js';

export async function postUserPredToRedis(
  redis: RedisClient,
  postId: string,
  userId: string,
  userPreds: PredictionType
) {
  await redis.hSet(`${REDIS_USER_PREDICTION}${postId}`, { [userId]: JSON.stringify(userPreds) });
  await redis.expire(`${REDIS_USER_PREDICTION}${postId}`, 86400); // 1 day
}

export async function getUserPredsFromRedis(redis: RedisClient, postId: string, userId: string) {
  return await redis.hGet(`${REDIS_USER_PREDICTION}${postId}`, userId);
}

export async function getAllUserPredictionsFromRedis(redis: RedisClient, postId: string) {
  const allPredictions = await redis.hGetAll(`${REDIS_USER_PREDICTION}${postId}`);
  const userPredictions: { userId: string; prediction: PredictionType }[] = [];
  for (const userId in allPredictions) {
    userPredictions.push({
      userId: userId,
      prediction: JSON.parse(allPredictions[userId]),
    });
  }
  return userPredictions;
}

export async function generateAllPredictionsFromRedis(redis: RedisClient, postId: string) {
  const allPredictions = await redis.hGetAll(`${REDIS_USER_PREDICTION}${postId}`);
  const predictions: PredictionType[] = [];
  for (const userId in allPredictions) {
    predictions.push(JSON.parse(allPredictions[userId]));
  }
  return predictions;
}
