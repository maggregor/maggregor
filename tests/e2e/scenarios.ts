import { MongoClient, ObjectId } from 'mongodb';

export default [
  {
    name: 'Get user by ID',
    request: async (client: MongoClient) => {
      const db = client.db(global.__TEST_DB__);
      const result = await db
        .collection(global.__TEST_COLLECTION__)
        .findOne({ _id: 1 as any });
      return result;
    },
    expectedResponse: {
      _id: 1,
      name: 'User 1',
      email: 'user1@example.com',
      age: 1,
      city: 'Los Angeles',
    },
  },
];
