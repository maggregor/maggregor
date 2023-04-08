import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll } from 'vitest';
import waitPort from 'wait-port';
import { config } from 'dotenv';
import { MaggregorProcess } from './setup-maggregor';
import { MongoClient, ObjectId } from 'mongodb';

config({ path: '.env.test' });

global.__TEST_DB__ = 'mydb';
global.__TEST_COLLECTION__ = 'mycoll';

let mongodbServer: MongoMemoryServer;
let maggregor: MaggregorProcess = new MaggregorProcess();
beforeAll(async () => {
  if (!process.env.MONGODB_TARGET_URI) {
    mongodbServer = await MongoMemoryServer.create();
    process.env.MONGODB_TARGET_URI = mongodbServer.getUri();
  }
  maggregor.start();
  const host = process.env.PROXY_HOST;
  const port = parseInt(process.env.PROXY_PORT);
  await waitPort({ host, port });
  const clientWithProxy = await MongoClient.connect(
    `mongodb://${host}:${port}`,
  );
  const clientInDirect = await MongoClient.connect(
    process.env.MONGODB_TARGET_URI,
  );
  expect(await clientInDirect.db().admin().listDatabases()).toEqual(
    await clientWithProxy.db().admin().listDatabases(),
  );
  await loadData(clientInDirect);
  global.__MONGO_CLIENT_MAGGREGOR__ = clientWithProxy;
  global.__MONGO_CLIENT_DIRECT__ = clientInDirect;
});

afterAll(async () => {
  await global.__MONGO_CLIENT_MAGGREGOR__?.close();
  await global.__MONGO_CLIENT_DIRECT__?.close();
  await mongodbServer?.stop();
  maggregor.stop();
});

async function loadData(client: MongoClient) {
  const db = client.db(global.__TEST_DB__);
  const collection = db.collection(global.__TEST_COLLECTION__);
  const testData = [];

  // Generate test data
  for (let i = 0; i < 10000; i++) {
    const doc = {
      _id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: i % 100,
      city: i % 10 === 0 ? 'New York' : 'Los Angeles',
    };
    testData.push(doc);
  }

  // Insert test data into collection
  await collection.insertMany(testData);
}
