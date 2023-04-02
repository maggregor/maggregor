import { prepareDbForScenarios, scenarios } from './scenarios';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { startNestServer } from './utils';

let mongoServer: MongoMemoryServer;
let client: MongoClient;
let db: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  startNestServer(uri.split(':')[2].replace('/', ''));
  client = new MongoClient('mongodb://127.0.0.1:4000/');
  await client.connect();
  db = client.db('testdb');
  prepareDbForScenarios(db);
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

scenarios.forEach((aggregation, index) => {
  test(`Aggregation Test ${index + 1}: ${aggregation.name}`, async () => {
    const result = await db
      .collection('myCollection')
      .aggregate(aggregation.pipeline)
      .toArray();
    expectEqualsArrayIgnoreOrder(result, aggregation.expectedResult);
  });
});

function expectEqualsArrayIgnoreOrder(a: any[], b: any[]) {
  expect(a.length).toEqual(b.length);
  a.forEach((item) => expect(b).toContainEqual(item));
}
