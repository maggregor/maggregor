import * as Benchmark from 'benchmark';
import { MaggregorBenchmarkScenario } from 'benchmarks';
import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MaggregorProcess, startMaggregor } from '../tests/e2e/setup-maggregor';
import {
  loadTestData,
  startMongoServer,
  startRedisServer,
} from '../tests/e2e/utils';
import logger from '../tests/__utils__/logger';
import fs from 'fs';
import RedisMemoryServer from 'redis-memory-server';

const COLLECTION = 'mycoll';
const DATABASE = 'mydb';
const OUTPUT_DIR = 'benchmarks/.results';

let mongodb: MongoMemoryReplSet;
let maggregor: MaggregorProcess;
let redis: RedisMemoryServer;

export type RunnerOptions = {
  totalDocs: number;
  flushResults: boolean;
};

export async function runBenchmarks(
  scenarios: MaggregorBenchmarkScenario[],
  opts: RunnerOptions,
) {
  mongodb = await startMongoServer();
  redis = await startRedisServer();
  maggregor = await startMaggregor({
    targetUri: mongodb.getUri(),
    port: 4200,
    redisPort: await redis.getPort(),
  });
  const totalScenarios = scenarios.length;
  let totalScenariosSuccessed = 0;
  for (const s of scenarios) {
    await new Promise<void>(async (resolve) => {
      logger.debug(`Prepare benchmark: '${s.name}' (${s.description})`);
      await setup(s, opts);
      const suite = await createBenchmarkSuite(s);
      logger.debug(`Starting benchmark: '${s.name}'`);
      suite.on('cycle', (event: Benchmark.Event) => {
        logger.info(String(event.target));
      });
      suite.on('complete', function (this: Benchmark.Suite) {
        if (opts.flushResults) {
          flushResults(s.name, this);
        }
        const percent = s.expectedSpeed ? s.expectedSpeed[opts.totalDocs] : 0.9;
        if (expectMaggregorFaster(percent, this)) {
          totalScenariosSuccessed++;
        }
        logger.debug(`Finished benchmark: '${s.name}'`);
        resolve();
      });
      suite.run({ async: false });
    });
  }
  const exitCode = totalScenariosSuccessed < totalScenarios ? 1 : 0;
  logger.info(`Success rate: ${totalScenariosSuccessed}/${totalScenarios}`);
  stopAll(exitCode);
}

async function createBenchmarkSuite(
  s: MaggregorBenchmarkScenario,
): Promise<Benchmark.Suite> {
  const suite = new Benchmark.Suite();
  const mongoClient = await createClient(mongodb.getUri());
  suite.add('MongoDB', {
    defer: true,
    // initCount: 1000,
    fn: async (deferred: { resolve: () => void }) => {
      await s.run(mongoClient, DATABASE, COLLECTION);
      deferred.resolve();
    },
  });
  const maggregorClient = await createClient(maggregor.getUri());
  suite.add('Maggregor x MongoDB', {
    defer: true,
    // initCount: 1000,
    fn: async (deferred: { resolve: () => void }) => {
      await s.run(maggregorClient, DATABASE, COLLECTION);
      deferred.resolve();
    },
  });
  return suite;
}

async function setup(
  scenario: MaggregorBenchmarkScenario,
  opts: RunnerOptions,
) {
  const client = await createClient(mongodb.getUri());
  logger.debug(`Cleaning Maggregor's internal database`);
  await maggregor?.clearDatabase();
  logger.debug(`Cleaning collection '${COLLECTION}'`);
  await cleanCollection();
  await loadTestData(client, {
    collection: COLLECTION,
    db: DATABASE,
    totalDocs: opts.totalDocs,
  });
}

async function cleanCollection() {
  const client = await createClient(mongodb.getUri());
  return client.db(DATABASE).collection(COLLECTION).deleteMany({});
}

function stopAll(exitCode = 0) {
  mongodb?.stop();
  maggregor?.stop();
  // I don't know why, but the process doesn't exit without this
  process.exit(exitCode);
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

// Return true if Maggregor is faster than expected
function expectMaggregorFaster(
  minSpeedPercent: number,
  suite: Benchmark.Suite,
): boolean {
  const benchs = suite.filter('successful');
  const fastestBenchs = benchs.filter('fastest');
  const mongoBench = benchs[0];
  const maggreBench = benchs[1];
  if (fastestBenchs.length > 1) {
    logger.warn('Mongodb and Maggregor are equally fast');
  }
  const maggreMinHz = maggreBench.hz / minSpeedPercent;
  const fmtExpected = (minSpeedPercent * 100).toFixed(0);
  const fmtActual = ((maggreBench.hz / mongoBench.hz) * 100).toFixed(0);
  if (mongoBench.hz > maggreMinHz) {
    let msg = 'Maggregor is slower than expected. ';
    msg += `Expected: minimum ${fmtExpected}% of MongoDB speed but got only ${fmtActual}%`;

    logger.error(msg);
    return false;
  } else {
    logger.info(
      `Maggregor fast enough: ${fmtActual}% of MongoDB speed (expected: >=${fmtExpected}%)`,
    );
  }
  return true;
}
