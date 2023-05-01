import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';

// Maggregor doesn't improve the performance of distinct
// No expected speed
const scenario: MaggregorBenchmarkScenario = {
  name: 'distinct',
  description: 'distinct city | no changes',
  run: async (client: MongoClient, db: string, collection: string) => {
    await client.db(db).collection(collection).distinct('city');
  },
};

export default scenario;
