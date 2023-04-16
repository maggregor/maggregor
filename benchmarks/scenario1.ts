import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';

const scenario: MaggregorBenchmarkScenario = {
  name: '100k-aggregate',
  description: '100k documents, no changes',
  data: {
    start: 100000,
  },
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
