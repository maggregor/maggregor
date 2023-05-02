/**
 * This script is used to run a MongoDB instance for testing purposes.
 *
 * Run this script with `ts-node scripts/run-mongodb.ts`.
 */

import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import logger from '../tests/__utils__/logger';
import { loadTestData } from '../tests/e2e/utils';

logger.info('Starting MongoDB instance...');

MongoMemoryReplSet.create({
  replSet: { count: 3 },
  instanceOpts: [
    { storageEngine: 'wiredTiger', port: 27017 },
    { storageEngine: 'wiredTiger' },
    { storageEngine: 'wiredTiger' },
  ],
}).then(async (server) => {
  server.waitUntilRunning();
  const uri = server.getUri();
  logger.info(`MongoDB ready on: ${uri}`);
  const client = await MongoClient.connect(uri);
  await loadTestData(client);
});
