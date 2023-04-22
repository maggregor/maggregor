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

export type RunnerOptions = {
  totalDocs: number;
  flushResults: boolean;
};

export async function runBenchmarks(
  scenarios: MaggregorBenchmarkScenario[],
  opts: RunnerOptions,
) {
  mongodb = await startMongoServer();
  maggregor = await startMaggregor({ targetUri: mongodb.getUri() });
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
        if (expectMaggregorFaster(s, this)) {
          totalScenariosSuccessed++;
        }
        logger.debug(`Finished benchmark: '${s.name}'`);
        resolve();
      });
      suite.run({ async: true });
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
    fn: async (deferred: { resolve: () => void }) => {
      await s.run(mongoClient, DATABASE, COLLECTION);
      deferred.resolve();
    },
  });
  const maggregorClient = await createClient(maggregor.getUri());
  suite.add('Maggregor x MongoDB', {
    defer: true,
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
  s: MaggregorBenchmarkScenario,
  suite: Benchmark.Suite,
): boolean {
  const benchs = suite.filter('successful');
  const fastestBenchs = benchs.filter('fastest');
  const mongoBench = benchs[0];
  const maggreBench = benchs[1];
  const mustBeFaster = !!s.expectedSpeedTreshold;
  if (fastestBenchs.length > 1) {
    logger.warn('The both ways are equally fast.');
    if (!mustBeFaster) {
      // Everything is fine if we don't expect Maggregor to be faster.
      return true;
    }
  }
  const th = s.expectedSpeedTreshold || 0.8;
  const maggreMinHz = maggreBench.hz / th;
  const times = maggreBench.hz / mongoBench.hz;
  if (mongoBench.hz > maggreMinHz) {
    let baseMessage = 'Maggregor is slower than expected. ';
    if (times < 1) {
      baseMessage += `Expected: ${th}x faster but got ${1 - times}x slower.`;
    } else {
      baseMessage += `Expected: ${th}x faster but got only ${times}x faster.`;
    }
    logger.error(baseMessage);
    return false;
  } else {
    logger.info(`Maggregor fast enough: ${maggreBench.hz.toFixed(2)}x faster`);
  }
  return true;
}
