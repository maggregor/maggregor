import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';

const scenario: MaggregorBenchmarkScenario = {
  name: 'count',
  description: 'count all and counter new york users | no changes',
  // Maggregor doesn't improve the performance of count
  // expectedSpeedTreshold: 0,
  run: async (client: MongoClient, db: string, collection: string) => {
    const req1 = client.db(db).collection(collection).count();
    const req2 = client
      .db(db)
      .collection(collection)
      .count({ city: 'New York' });
    await Promise.all([req1, req2]);
  },
};

export default scenario;
