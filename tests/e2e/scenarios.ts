import { MongoClient } from 'mongodb';

export default [
  {
    name: 'Get user by ID',
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
].map((scenario) => ({
  ...scenario,
  // Display the scenario name in the test results
  toString: () => `${scenario.name}`,
}));
