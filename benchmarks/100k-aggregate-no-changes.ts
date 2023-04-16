import * as Benchmark from 'benchmark';
import { MaggregorProcess } from '../tests/e2e/setup-maggregor';
import {
  healthCheck,
  loadTestData,
  startMongoServer,
} from '../tests/e2e/utils';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

const suite = new Benchmark.Suite();
let maggregor: MaggregorProcess;
let mongodb: MongoMemoryReplSet;

const runAggregate = (client: MongoClient) => {
  return client
    .db('mydb')
    .collection('mycoll')
    .aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();
};

const run = async () => {
  mongodb = await startMongoServer();
  // Will be used by Maggregor
  process.env.MONGODB_TARGET_URI = mongodb.getUri();
  maggregor = await new MaggregorProcess().start();
  const { host, port } = maggregor.processParams;
  const maggreUri = `mongodb://${host}:${port}`;
  const mongoUri = mongodb.getUri();
  const mongoClient = await MongoClient.connect(mongoUri, {
    maxPoolSize: 1,
  });
  const maggreClient = await MongoClient.connect(maggreUri, {
    directConnection: true,
    maxPoolSize: 1,
  });

  await loadTestData(mongoClient, {
    db: 'mydb',
    collection: 'mycoll',
    totalDocs: 100000,
    batchSize: 2000,
  });
  await healthCheck(maggreClient, mongoClient, 'mydb');

  // Register scenarios
  suite
    .add('Maggregor + MongoDB', {
      defer: true,
      fn: async (deferred: { resolve: () => void }) => {
        await runAggregate(maggreClient);
        deferred.resolve();
      },
    })
    .add('MongoDB', {
      defer: true,
      fn: async (deferred: { resolve: () => void }) => {
        await runAggregate(mongoClient);
        deferred.resolve();
      },
    });

  // Listen to events
  suite
    .on('cycle', (e: Event) => {
      console.debug(String(e.target));
    })
    .on('complete', function () {
      console.debug('Fastest is ' + this.filter('fastest').map('name'));
      afterAll();
    })
    .on('error', (e: Error) => {
      console.error(e);
      afterAll();
    });

  // Run async
  suite.run({ async: true });
};

const afterAll = async () => {
  maggregor.stop();
  await mongodb.stop();
  process.exit();
};

process.on('exit', () => afterAll());
run();
