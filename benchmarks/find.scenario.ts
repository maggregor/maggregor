import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';

const scenario: MaggregorBenchmarkScenario = {
  name: 'find',
  description: 'aggregate documents, no doc changes',
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
