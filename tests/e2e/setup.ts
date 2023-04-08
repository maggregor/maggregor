import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll } from 'vitest';
import waitPort from 'wait-port';
import { config } from 'dotenv';
import { MaggregorProcess } from './setup-maggregor';
import { MongoClient } from 'mongodb';

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
  await loadTestData(clientInDirect);
  global.__MONGO_CLIENT_MAGGREGOR__ = clientWithProxy;
  global.__MONGO_CLIENT_DIRECT__ = clientInDirect;
});

afterAll(async () => {
  await global.__MONGO_CLIENT_MAGGREGOR__?.close();
  await global.__MONGO_CLIENT_DIRECT__?.close();
  await mongodbServer?.stop();
  maggregor.stop();
});

async function loadTestData(client: MongoClient) {
  const db = client.db(global.__TEST_DB__);
  const collection = db.collection(global.__TEST_COLLECTION__);
  const batchSize = 1000;
  const totalDocs = 100000;

  for (let i = 0; i < totalDocs; i += batchSize) {
    const testData = [];
    for (let j = i; j < i + batchSize; j++) {
      const doc = {
        name: `User ${j}`,
        email: `user${j}@example.com`,
        age: j % 100,
        city: j % 10 === 0 ? 'New York' : 'Los Angeles',
        address: {
          street: `123 Main St.`,
          city: `Los Angeles`,
          state: `CA`,
          zip: j % 10000,
        },
      };
      if (j % 3 === 0) {
        delete doc.address;
      }
      if (j % 5 === 0) {
        delete doc.age;
      }
      testData.push(doc);
    }
    await collection.insertMany(testData);
  }
}
