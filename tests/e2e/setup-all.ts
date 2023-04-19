import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { beforeAll, afterAll } from 'vitest';
import { config } from 'dotenv';
import { MaggregorProcess } from './setup-maggregor';
import { MongoClient } from 'mongodb';
import { healthCheck, loadTestData, startMongoServer } from './utils';

config({ path: '.env.test' });

const targetMongo = process.env.MONGODB_TARGET_URI;

global.__TEST_DB__ = 'mydb';
global.__TEST_COLLECTION__ = 'mycoll';

let mongodb: MongoMemoryReplSet;
let maggregor: MaggregorProcess;

beforeAll(async () => {
  if (!targetMongo) {
    // No target mongo uri, use in-memory mongodb
    mongodb = await startMongoServer();
    process.env.MONGODB_TARGET_URI = mongodb.getUri();
  }
  maggregor = await new MaggregorProcess().start();
  console.debug('Maggregor started on', maggregor.getUri());
  const maggreUri = maggregor.getUri();
  const mongoUri = process.env.MONGODB_TARGET_URI || mongodb.getUri();
  console.debug('MongoDB URI:', mongoUri);
  const maggreClient = await MongoClient.connect(maggreUri, {
    directConnection: true,
  });
  const mongoClient = await MongoClient.connect(mongoUri, {
    directConnection: true,
  });
  // Initial check list databases
  await loadTestData(mongoClient);
  await healthCheck(maggreClient, mongoClient);
  global.__MAGGRE_CLIENT__ = maggreClient;
  global.__MONGO_CLIENT__ = mongoClient;
  global.__MAGGRE_URI__ = maggreUri;
  global.__MONGO_URI__ = mongoUri;
});

afterAll(async () => {
  await global.__MAGGRE_CLIENT__?.close();
  await global.__MONGO_CLIENT__?.close();
  await mongodb?.stop();
  maggregor.stop();
});
