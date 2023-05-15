import type { MongoClient } from 'mongodb';
import { wait } from '../utils';
export interface E2EScenarios {
  name: string;
  // Will run the request on MongoDB and Maggregor asynchronously
  asyncCompare?: boolean;
  request: (client: MongoClient) => Promise<any>;
}

export default [
  {
    name: 'Get user by ID',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .find({ age: { $lt: 30 } })
        .toArray();
      return result;
    },
  },
  {
    name: 'Get all users',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .find({})
        .toArray();
      return result;
    },
  },
  {
    name: 'Get users in New York',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .find({ city: 'New York' })
        .toArray();
      return result;
    },
  },
  {
    name: 'Get users under 18 in Los Angeles',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .find({ city: 'Los Angeles', age: { $lt: 18 } })
        .toArray();
      return result;
    },
  },
  {
    name: 'Get users over 50 with no address',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .find({ age: { $gt: 50 }, address: { $exists: false } })
        .toArray();
      return result;
    },
  },
  {
    name: 'Get users with a zip code divisible by 5000',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .find({ 'address.zip': { $mod: [5000, 0] } })
        .toArray();
      return result;
    },
  },
  {
    name: 'Get users without an age',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .find({ age: { $exists: false } })
        .toArray();
      return result;
    },
  },
  {
    name: 'Get users without an address',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .find({ address: { $exists: false } })
        .toArray();
      return result;
    },
  },
  {
    name: 'Get average age by city and state',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const pipeline = [
        {
          $group: {
            _id: {
              city: '$city',
            },
            avgAge: { $avg: '$age' },
          },
        },
        {
          $sort: {
            avgAge: -1,
          },
        },
      ];
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .aggregate(pipeline)
        .toArray();
      return result;
    },
  },
  {
    name: 'Get group by with multiple fields',
    asyncCompare: true,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const pipeline = [
        {
          $group: {
            _id: {
              state: '$state',
            },
            avgAge: { $avg: '$age' },
            maxAge: { $max: '$age' },
            truncateCity: { $first: '$city' },
          },
        },
        {
          $addFields: {
            city: {
              $concat: [
                { $substrCP: ['$truncateCity', 0, 1] },
                {
                  $substrCP: [
                    '$truncateCity',
                    1,
                    { $subtract: [{ $strLenCP: '$truncateCity' }, 1] },
                  ],
                },
              ],
            },
          },
        },
        {
          $sort: {
            avgAge: -1,
          },
        },
      ];
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .aggregate(pipeline)
        .toArray();
      return result;
    },
  },
  {
    name: 'Cache invalidation on insert, delete and update',
    asyncCompare: false,
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const c = db.collection('col2');
      // Count documents before insert
      const res1 = await c.aggregate([{ $count: 'count' }]).toArray();
      const inserted = await c.insertOne({ name: 'John Doe' });
      await wait(500); // Wait for cache invalidation
      // Count documents after insert
      const res2 = await c.aggregate([{ $count: 'count' }]).toArray();
      await c.deleteOne({ _id: inserted.insertedId });
      await wait(500); // Wait for cache invalidation
      // Count documents after delete
      const res3 = await c.aggregate([{ $count: 'count' }]).toArray();

      return [res1, res2, res3];
    },
  },
].map((scenario) => ({
  ...scenario,
  // Display the scenario name in the test results
  toString: () => `${scenario.name}`,
}));
