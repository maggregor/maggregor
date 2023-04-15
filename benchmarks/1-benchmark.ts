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

const aggregate = [
  {
    $group: {
      _id: '$city',
      count: { $sum: 1 },
    },
  },
];

const run = async () => {
  maggregor = new MaggregorProcess();
  mongodb = await startMongoServer();
  process.env.MONGODB_TARGET_URI = mongodb.getUri();
  const { host, port } = await maggregor.start();
  const maggreUri = `mongodb://${host}:${port}`;
  const mongoUri = mongodb.getUri();
  const monClient = await MongoClient.connect(mongoUri, {
    maxPoolSize: 1,
  });
  const magClient = await MongoClient.connect(
    `mongodb://127.0.0.1:4100/?directConnection=true`,
    {
      maxPoolSize: 1,
    },
  );

  await loadTestData(monClient, {
    db: 'mydb',
    collection: 'mycoll',
    totalDocs: 100000,
    batchSize: 2000,
  });
  await healthCheck(magClient, monClient, 'mydb');

  // Defer the execution of the add methods
  await suite
    .add('Maggregor + MongoDB', {
      defer: true,
      fn: async (deferred: { resolve: () => void }) => {
        await magClient
          .db('mydb')
          .collection('mycoll')
          .aggregate(aggregate)
          .toArray();
        deferred.resolve();
      },
    })
    .add('MongoDB', {
      defer: true,
      fn: async (deferred: { resolve: () => void }) => {
        await monClient
          .db('mydb')
          .collection('mycoll')
          .aggregate(aggregate)
          .toArray();
        deferred.resolve();
      },
    })
    .on('cycle', (e: Event) => {
      console.debug(String(e.target));
    })
    .on('complete', function () {
      console.debug('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({ async: false });
};

const stopAll = async () => {
  console.debug('Close...');
  maggregor.stop();
  mongodb.stop();
  console.debug('Closed');
};

process.on('exit', () => stopAll());
run();
