import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';

const scenario: MaggregorBenchmarkScenario = {
  name: 'distinct',
  description: 'distinct city | no changes',
  // Maggregor doesn't improve the performance of distinct
  // expectedSpeedTreshold: 0,
  run: async (client: MongoClient, db: string, collection: string) => {
    await client.db(db).collection(collection).distinct('city');
  },
};

export default scenario;
