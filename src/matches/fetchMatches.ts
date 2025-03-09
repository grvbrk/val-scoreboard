import { RedisClient } from '@devvit/public-api';
import { REDIS_MATCH_TYPE, REDIS_UPCOMING_MATCH_DATA } from '../utils/redis.js';
import { MatchSegment, PageType } from '../core/types.js';

export async function fetchExistingMatchPost(redis: RedisClient, key: string) {
  return await redis.get(key);
}

export async function postUpcomingMatchDataToRedis(
  redis: RedisClient,
  postId: string,
  upcomingMatchData: MatchSegment
) {
  return await redis.set(
    `${REDIS_UPCOMING_MATCH_DATA}${postId}`,
    JSON.stringify(upcomingMatchData)
  );
}

export async function getUpcomingMatchDataFromRedis(redis: RedisClient, postId: string) {
  return await redis.get(`${REDIS_UPCOMING_MATCH_DATA}${postId}`);
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
