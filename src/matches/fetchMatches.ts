import { RedisClient } from '@devvit/public-api';
import { REDIS_MATCH_TYPE, REDIS_UPCOMING_MATCH_INFO } from '../utils/redis.js';
import { PageType } from '../core/types.js';

export async function postMatchInfoToRedis(
  redis: RedisClient,
  postId: string,
  upcomingMatchInfo: {
    team1: string;
    team2: string;
    match_page: string;
  }
) {
  return await redis.set(
    `${REDIS_UPCOMING_MATCH_INFO}${postId}`,
    JSON.stringify(upcomingMatchInfo)
  );
}

export async function getMatchInfoFromRedis(redis: RedisClient, postId: string) {
  return await redis.get(`${REDIS_UPCOMING_MATCH_INFO}${postId}`);
}

export async function getMatchTypeFromRedis(redis: RedisClient, postId: string) {
  return await redis.get(`${REDIS_MATCH_TYPE}${postId}`);
}

export async function postMatchPageTypeToRedis(
  redis: RedisClient,
  postId: string,
  matchType: PageType
) {
  await redis.set(`${REDIS_MATCH_TYPE}${postId}`, matchType);
}
