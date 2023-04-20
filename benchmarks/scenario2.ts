import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';

const scenario: MaggregorBenchmarkScenario = {
  name: '500k-find',
  description: '500k documents, no changes',
  data: {
    start: 50000,
  },
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
