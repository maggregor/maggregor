import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';

const scenario: MaggregorBenchmarkScenario = {
  name: '10k-find',
  description: '10k documents, no changes',
  data: {
    start: 10000,
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
