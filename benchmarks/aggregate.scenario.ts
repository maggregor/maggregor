import { INCACHE_EXPECTED_SPEED } from './expected-speed';
import { MaggregorBenchmarkScenario } from './index';
import { MongoClient } from 'mongodb';

const scenario: MaggregorBenchmarkScenario = {
  name: 'aggregate',
  description: 'group by city and calculate a sum | no changes',
  expectedSpeed: INCACHE_EXPECTED_SPEED,
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
