import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;
let client: MongoClient;
let db: any;

const testAggregations: Array<{
  name: string;
  pipeline: any[];
  expectedResult: any[];
}> = [
  {
    name: 'Test 1',
    pipeline: [
      { $match: { field1: { $gte: 1 } } },
      { $group: { _id: '$field2', total: { $sum: '$field3' } } },
    ],
    expectedResult: [
      { _id: 'value1', total: 13590 },
      { _id: 'value2', total: 22590 },
      { _id: 'value3', total: 31590 },
      { _id: 'value4', total: 40590 },
      { _id: 'value6', total: 58590 },
      { _id: 'value0', total: 4590 },
      { _id: 'value8', total: 76590 },
      { _id: 'value9', total: 85590 },
      { _id: 'value5', total: 49590 },
      { _id: 'value7', total: 67590 },
    ],
  },
  {
    name: 'Test 2',
    pipeline: [
      { $match: { field1: { $gte: 1 } } },
      { $group: { _id: '$field1', total: { $sum: '$field1' } } },
    ],
    expectedResult: [
      { _id: 7, total: 700 },
      { _id: 3, total: 300 },
      { _id: 5, total: 500 },
      { _id: 2, total: 200 },
      { _id: 8, total: 800 },
      { _id: 6, total: 600 },
      { _id: 9, total: 900 },
      { _id: 1, total: 100 },
      { _id: 4, total: 400 },
    ],
  },
];

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'testdb',
    },
  });
  const uri = mongoServer.getUri();
  console.log(`MongoDB URI: ${uri}`);
  client = new MongoClient('mongodb://localhost:4000/');
  await client.connect();
  db = client.db('testdb');
  await db.collection('myCollection').insertMany(
    [...Array(1000)].map((_, index) => ({
      _id: index,
      field1: index % 10,
      field2: `value${Math.floor(index / 100)}`,
      field3: index + 1,
    })),
  );
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

testAggregations.forEach((aggregation, index) => {
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
