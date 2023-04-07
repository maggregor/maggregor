import scenarios from './scenarios';
import { deepEqual } from 'assert';

test('MongoDB e2e test', async (t) => {
  const client = global.__MONGO_CLIENT__;

  console.log(client);
  for (const scenario of scenarios) {
    const result = await scenario.request(client);
    deepEqual(result, scenario.expectedResponse, scenario.name);
  }
});
