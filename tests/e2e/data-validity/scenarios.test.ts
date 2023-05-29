import { MongoClient } from 'mongodb';
import { setupContext, contexts, Context } from '../contexts';
import scenarios from './scenarios';
import { wait } from '../utils';

global.__TEST_DB__ = 'mydb';
global.__TEST_COLLECTION__ = 'mycoll';

async function runTests(context: Context) {
  describe(`Data validity tests (${context.name})`, async () => {
    let maggreClient: MongoClient;
    let mongoClient: MongoClient;

    beforeAll(async () => {
      const clients = await setupContext(context);
      maggreClient = clients.maggreClient;
      mongoClient = clients.mongoClient;
    });

    test.concurrent.each(scenarios)('Scenario %#: %s', async (scenario) => {
      let actual: any[], expected: any[];
      if (scenario.asyncCompare) {
        const p1 = scenario.request(maggreClient);
        const p2 = scenario.request(mongoClient);
        [actual, expected] = await Promise.all([p1, p2]);
      } else {
        actual = await scenario.request(maggreClient);
        expected = await scenario.request(mongoClient);
      }
      expect(actual.length).toBe(expected.length);
      expect(actual.sort()).toEqual(expected.sort());
    });
    afterAll(async () => {
      context.maggregor?.stop();
      await maggreClient?.close();
      await mongoClient?.close();
      await wait(1000);
    });
  });
}

contexts.forEach(async (context) => {
  await runTests(context);
});
