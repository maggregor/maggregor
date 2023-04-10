import scenarios from './scenarios';
import { deepStrictEqual } from 'assert';

describe('MongoDB e2e tests', () => {
  test.concurrent.each(scenarios)('Scenario %#: %s', async (scenario) => {
    const promises = Array.from({ length: 10 }).map(async (_, i) => {
      const clientExpected = global.__MONGO_CLIENT_DIRECT__;
      const clientActual = global.__MONGO_CLIENT_MAGGREGOR__;
      const p1 = scenario.request(clientActual);
      const p2 = scenario.request(clientExpected);
      const [result, expected] = await Promise.all([p1, p2]);
      expect(result.length).toBe(expected.length);
      deepStrictEqual(result, expected);
    });
    await Promise.all(promises);
  });
});
