import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';

const scenario: MaggregorBenchmarkScenario = {
  name: 'aggregate',
  description: 'aggregate documents, no doc changes',
  // Maggregor must be at least 10x faster than MongoDB
  expectedSpeedTreshold: 10,
  run: async (client: MongoClient, db: string, collection: string) => {
    await client
      .db(db)
      .collection(collection)
      .aggregate([
        {
          $group: {
            _id: '$city',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
  },
};

export default scenario;
