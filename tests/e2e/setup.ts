import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll } from 'vitest';

let mongod: MongoMemoryServer;
let mongoUri: string;
let mongoDbName: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  mongoUri = mongod.getUri();
});

afterAll(async () => {
  if (mongod) {
    await mongod.stop();
  }
});

export default {
  globalSetup: async () => {
    global.__MONGO_URI__ = mongoUri;
  },
};
