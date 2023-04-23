import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';

const scenario: MaggregorBenchmarkScenario = {
  name: 'find',
  description: 'find a user by his name | no changes',
  run: async (client: MongoClient, db: string, collection: string) => {
    await client
      .db(db)
      .collection(collection)
      .find({
        name: 'User 42',
      })
      .toArray();
  },
};

export default scenario;
