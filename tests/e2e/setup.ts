import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { beforeAll, afterAll } from 'vitest';
import waitPort from 'wait-port';
import { config } from 'dotenv';
import { MaggregorProcess } from './setup-maggregor';
import { MongoClient } from 'mongodb';

config({ path: '.env.test' });

global.__TEST_DB__ = 'mydb';
global.__TEST_COLLECTION__ = 'mycoll';

let mongodbServer: MongoMemoryReplSet;
const mg: MaggregorProcess = new MaggregorProcess();
beforeAll(async () => {
  if (!process.env.MONGODB_TARGET_URI) {
    mongodbServer = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    process.env.MONGODB_TARGET_URI = mongodbServer.getUri();
  }
  mg.start();
  const host = 'localhost';
  const port = parseInt(process.env.PROXY_PORT || '27017');
  await waitPort({ host, port });
  const maggreUri = `mongodb://${host}:${port}`;
  const mongoUri = process.env.MONGODB_TARGET_URI;
  const maggreClient = await MongoClient.connect(maggreUri);
  const mongoClient = await MongoClient.connect(mongoUri);
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
  await mongodbServer?.stop();
  mg.stop();
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

async function healthCheck(
  maggreClient: MongoClient,
  mongoClient: MongoClient,
) {
  const maggreDb = maggreClient.db(global.__TEST_DB__);
  const mongoDb = mongoClient.db(global.__TEST_DB__);

  const maggreCollections = await maggreDb.listCollections().toArray();
  const mongoCollections = await mongoDb.listCollections().toArray();

  const promises: Promise<void>[] = [];

  for (let i = 0; i < maggreCollections.length; i++) {
    const maggreCollection = maggreDb.collection(maggreCollections[i].name);
    const mongoCollection = mongoDb.collection(mongoCollections[i].name);

    const maggreCountPromise = maggreCollection.countDocuments();
    const mongoCountPromise = mongoCollection.countDocuments();

    promises.push(
      new Promise<void>((resolve, reject) => {
        Promise.all([maggreCountPromise, mongoCountPromise])
          .then(([maggreCount, mongoCount]) => {
            expect(maggreCount).toEqual(mongoCount);
            resolve();
          })
          .catch(reject);
      }),
    );
  }

  await Promise.all(promises);
}
