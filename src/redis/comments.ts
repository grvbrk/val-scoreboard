import { RedisClient } from '@devvit/public-api';
import { REDIS_POST_COMMENT } from 'src/utils/redisKeys.js';

export async function postCommentToRedis(redis: RedisClient, postId: string) {
  await redis.set(`${REDIS_POST_COMMENT}${postId}`, postId);
}

export async function getCommentExistsFromRedis(redis: RedisClient, postId: string) {
  return await redis.exists(`${REDIS_POST_COMMENT}${postId}`);
}
