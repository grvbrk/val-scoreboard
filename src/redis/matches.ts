import { RedisClient } from '@devvit/public-api';
import {
  REDIS_FINAL_MATCH_RESULT,
  REDIS_MATCH_TYPE,
  REDIS_UPCOMING_MATCH_INFO,
} from '../utils/redisKeys.js';
import { PageType, SingleMatchResultSegment } from '../core/types.js';

export async function postMatchPageTypeToRedis(
  redis: RedisClient,
  postId: string,
  matchType: PageType
) {
  await redis.hSet(REDIS_MATCH_TYPE, { [postId]: matchType });
}

export async function getMatchPageTypeFromRedis(redis: RedisClient, postId: string) {
  return await redis.hGet(REDIS_MATCH_TYPE, postId);
}

export async function postMatchInfoToRedis(
  redis: RedisClient,
  postId: string,
  upcomingMatchInfo: {
    team1: string;
    team2: string;
    match_page: string;
  }
) {
  await redis.hSet(REDIS_UPCOMING_MATCH_INFO, {
    [postId]: JSON.stringify(upcomingMatchInfo),
  });
}

export async function getMatchInfoFromRedis(redis: RedisClient, postId: string) {
  return await redis.hGet(REDIS_UPCOMING_MATCH_INFO, postId);
}

export async function getAllPostIds(redis: RedisClient) {
  return await redis.hKeys(REDIS_UPCOMING_MATCH_INFO);
}

export async function postMatchResultToRedis(
  redis: RedisClient,
  postId: string,
  data: SingleMatchResultSegment
) {
  await redis.set(`${REDIS_FINAL_MATCH_RESULT}${postId}}`, JSON.stringify(data));
  await redis.expire(`${REDIS_FINAL_MATCH_RESULT}${postId}`, 3600);
}
export async function getMatchResultFromRedis(redis: RedisClient, postId: string) {
  return await redis.get(`${REDIS_FINAL_MATCH_RESULT}${postId}}`);
}
