import {RedisConnection} from './RedisConnection'
const redisClient = RedisConnection.getInstance().client

export function getClient () {
  return redisClient
}

/**
 * 清空redis所有缓存,仅供单元测试使用。
 */
export async function flushdb () {
  await redisClient.flushdb()
}
