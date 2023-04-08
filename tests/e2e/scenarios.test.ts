import scenarios from './scenarios';
import { deepEqual } from 'assert';

test('MongoDB e2e test', async (t) => {
  const clientExpected = global.__MONGO_CLIENT_DIRECT__;
  const clientActual = global.__MONGO_CLIENT_MAGGREGOR__;

  for (const scenario of scenarios) {
    const result = await scenario.request(clientActual);
    const expected = await scenario.request(clientExpected);
    deepEqual(result, expected);
  }
});
