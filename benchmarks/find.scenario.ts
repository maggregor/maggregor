import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';
import { INCACHE_EXPECTED_SPEED } from './expected-speed';

const scenario: MaggregorBenchmarkScenario = {
  name: 'find',
  description: 'find a user by his name | no changes',
  expectedSpeed: INCACHE_EXPECTED_SPEED,
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
