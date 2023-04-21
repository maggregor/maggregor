import * as Benchmark from 'benchmark';
import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MaggregorProcess, startMaggregor } from '../tests/e2e/setup-maggregor';
import { loadTestData, startMongoServer } from '../tests/e2e/utils';
import logger from '../tests/__utils__/logger';
import fs from 'fs';

const COLLECTION = 'mycoll';
const DATABASE = 'mydb';
const OUTPUT_DIR = 'benchmarks/.results';

let mongodb: MongoMemoryReplSet;
let maggregor: MaggregorProcess;

export async function runBenchmarks(
  scenarios: MaggregorBenchmarkScenario[],
  flush: boolean,
) {
  mongodb = await startMongoServer();
  maggregor = await startMaggregor({ targetUri: mongodb.getUri() });
  for (const s of scenarios) {
    await new Promise<void>(async (resolve) => {
      logger.debug(`Prepare benchmark: ${s.name} (${s.description})`);
      await setup(s);
      const suite = await createBenchmarkSuite(s);
      logger.debug(`Starting benchmark: ${s.name}`);
      suite.run({ async: false });
      suite.on('cycle', (event: Benchmark.Event) => {
        logger.info(String(event.target));
      });
      suite.on('complete', function (this: Benchmark.Suite) {
        if (flush) {
          flushResults(s.name, this);
        }
        logger.debug(`Finished benchmark: ${s.name}`);
        resolve();
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
  suite.on('complete', function (this: Benchmark.Suite) {
    const benchs = this.filter('successful');
    const first = benchs[0];
    const second = benchs[1];
    const diffPercent = (1 - first.hz / second.hz) * 100;
    if (this.filter('fastest').length > 1) {
      logger.warn('The both ways are equally fast.');
    } else if (diffPercent < 10) {
      logger.warn(
        `The difference is not significant: ${
          first.name
        } is ${diffPercent.toFixed(2)}% faster than ${second.name}.`,
      );
    } else {
      logger.info("The fastest is '" + benchs.map('name') + "'.");
    }
  });
  return suite;
}

async function setup(scenario: MaggregorBenchmarkScenario) {
  const client = await createClient(mongodb.getUri());
  logger.debug(`Cleaning collection ${COLLECTION}`);
  await cleanCollection();
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

function flushResults(scenarioName: string, suite: Benchmark.Suite) {
  const benchs = suite.filter('successful');
  const filename = `${scenarioName}.txt`;
  const filepath = `${OUTPUT_DIR}/${filename}`;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }

  benchs.forEach((bench: Benchmark) => {
    // This format is compatible with our GitHub Action workflow
    // https://github.com/benchmark-action/github-action-benchmark
    const fmtResult = String(bench);
    fs.appendFileSync(filepath, fmtResult + '\n');
  });

  logger.debug(`Benchmark results saved in ${filepath}`);
}
