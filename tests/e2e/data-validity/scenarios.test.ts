import scenarios from './scenarios';
import { deepStrictEqual } from 'assert';

describe('Data validity tests', () => {
  test.concurrent.each(scenarios)('Scenario %#: %s', async (scenario) => {
    const clientExpected = global.__MONGO_CLIENT__;
    const clientActual = global.__MAGGRE_CLIENT__;
    let result: any, expected: any;
    if (scenario.asyncCompare) {
      const p1 = scenario.request(clientActual);
      const p2 = scenario.request(clientExpected);
      [result, expected] = await Promise.all([p1, p2]);
    } else {
      result = await scenario.request(clientActual);
      expected = await scenario.request(clientExpected);
    }
    expect(result.length).toBe(expected.length);
    deepStrictEqual(result, expected);
  });
});
