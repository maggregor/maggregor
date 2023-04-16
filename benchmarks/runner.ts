import * as Benchmark from 'benchmark';
import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MaggregorProcess, startMaggregor } from '../tests/e2e/setup-maggregor';
import { loadTestData, startMongoServer } from '../tests/e2e/utils';

const COLLECTION = 'mycoll';
const DATABASE = 'mydb';

let mongodb: MongoMemoryReplSet;
let maggregor: MaggregorProcess;

export async function runBenchmarks(scenarios: MaggregorBenchmarkScenario[]) {
  mongodb = await startMongoServer();
  maggregor = await startMaggregor({ targetUri: mongodb.getUri() });
  for (const s of scenarios) {
    await new Promise<void>(async (resolve) => {
      console.log(`> Prepare benchmark: ${s.name} (${s.description})`);
      await setup(s);
      const suite = await createBenchmarkSuite(s);
      console.log(`> Starting benchmark: ${s.name}`);
      suite.run({ async: true });
      suite.on('complete', () => {
        resolve();
        console.log(`> Finished benchmark: ${s.name}`);
      });
    });
  }
  stopAll();
}

async function createBenchmarkSuite(
  s: MaggregorBenchmarkScenario,
): Promise<Benchmark.Suite> {
  const suite = new Benchmark.Suite();
  const mongoClient = await createClient(mongodb.getUri());
  suite.add('MongoDB', {
    defer: true,
    fn: async (deferred: { resolve: () => void }) => {
      await s.run(mongoClient, DATABASE, COLLECTION);
      deferred.resolve();
    },
  });
  const maggregorClient = await createClient(maggregor.getUri());
  suite.add('MongoDB with Maggregor', {
    defer: true,
    fn: async (deferred: { resolve: () => void }) => {
      await s.run(maggregorClient, DATABASE, COLLECTION);
      deferred.resolve();
    },
  });
  suite.on('cycle', (e: Event) => {
    console.debug(String(e.target));
  });
  suite.on('complete', function (this: Benchmark.Suite) {
    const results = this.filter('fastest');
    if (results.length > 1) {
      console.log('No clear winner found');
      return;
    }
    console.log('Fastest is ' + results.map('name'));
  });
  return suite;
}

async function setup(scenario: MaggregorBenchmarkScenario) {
  const client = await createClient(mongodb.getUri());
  console.log(`Cleaning collection ${COLLECTION}`);
  await cleanCollection();
  console.log(`Loading ${scenario.data.start} documents`);
  await loadTestData(client, {
    collection: COLLECTION,
    db: DATABASE,
    totalDocs: scenario.data.start,
  });
}

async function cleanCollection() {
  const client = await createClient(mongodb.getUri());
  return client.db(DATABASE).collection(COLLECTION).deleteMany({});
}

function stopAll() {
  mongodb?.stop();
  maggregor?.stop();
  // I don't know why, but the process doesn't exit without this
  process.exit(0);
}

function createClient(uri: string) {
  return MongoClient.connect(uri, {
    maxPoolSize: 1,
    directConnection: true,
  });
}
