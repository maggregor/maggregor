import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

const dbName = 'mydb';
const collectionName = 'mycoll';

MongoMemoryServer.create({
  instance: {
    port: 27017,
  },
}).then(async (server) => {
  const uri = server.getUri();
  const client = MongoClient.connect(uri);
  await loadTestData(await client);
});

async function loadTestData(client: MongoClient) {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const batchSize = 1000;
  const totalDocs = 1000000;

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
    process.stdout.write(`\r${i + batchSize}/${totalDocs}`);
  }
}
