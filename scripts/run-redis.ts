/**
 * This script is used to run a Redis instance for testing purposes.
 *
 * Run this script with `ts-node scripts/run-redis.ts`.
 */

import RedisMemoryServer from 'redis-memory-server';

import logger from '../tests/__utils__/logger';

async function startRedisServer() {
  const redisServer = await RedisMemoryServer.create({
    instance: {
      port: 6379,
    },
  });

  await redisServer.start();

  logger.info(`Redis server started on port ${await redisServer.getPort()}`);
}

startRedisServer();
