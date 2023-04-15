import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

export type LoadTestDataOptions = {
  collection?: string;
  db?: string;
  batchSize?: number;
  totalDocs?: number;
};

export async function loadTestData(
  client: MongoClient,
  options?: LoadTestDataOptions,
) {
  const opts = {
    collection: global.__TEST_COLLECTION__ || 'mycoll',
    db: global.__TEST_DB__ || 'mydb',
    batchSize: 1000,
    totalDocs: 10000,
    ...options,
  };
  console.debug(`Loading test data (${opts.totalDocs} docs)...`);
  const db = client.db(opts.db);
  const collection = db.collection(opts.collection);
  for (let i = 0; i < opts.totalDocs; i += opts.batchSize) {
    const testData = [];
    for (let j = i; j < i + opts.batchSize; j++) {
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
    process.stdout.write(`\r${i + opts.batchSize}/${opts.totalDocs}`);
  }
  console.debug('\nTest data loaded');
}

export async function startMongoServer() {
  const server = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  return server;
}

// Compare all countDocuments in each collections between maggregor and mongodb
export async function healthCheck(
  maggreClient: MongoClient,
  mongoClient: MongoClient,
  db?: string,
) {
  db = db || global.__TEST_DB__;
  console.debug('Running health check on db:', db);

  const maggreDb = maggreClient.db(db);
  const mongoDb = mongoClient.db(db);

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
            if (maggreCount !== mongoCount) {
              reject(
                new Error(
                  `Collection ${maggreCollection.collectionName} count mismatch: ${maggreCount} !== ${mongoCount}`,
                ),
              );
            }
            resolve();
          })
          .catch(reject);
      }),
    );
  }

  await Promise.all(promises);
  console.debug('Health check passed');
}
