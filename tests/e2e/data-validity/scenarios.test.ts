import scenarios from './scenarios';
import { deepStrictEqual } from 'assert';

describe('Data validity tests', () => {
  test.concurrent.each(scenarios)('Scenario %#: %s', async (scenario) => {
    const clientExpected = global.__MONGO_CLIENT__;
    const clientActual = global.__MAGGRE_CLIENT__;
    const p1 = scenario.request(clientActual);
    const p2 = scenario.request(clientExpected);
    console.log(
      p1.then(() => {
        console.log('Yes P1');
      }),
    );
    console.log(
      p2.then(() => {
        console.log('Yes P2');
      }),
    );
    const [result, expected] = await Promise.all([p1, p2]);
    expect(result.length).toBe(expected.length);
    deepStrictEqual(result, expected);
  });
});
