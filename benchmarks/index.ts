import { MongoClient } from 'mongodb';
import { runBenchmarks } from './runner';
import scenario1 from './aggregate.scenario';
import scenario2 from './find.scenario';
import logger from '../tests/__utils__/logger';
import yargs from 'yargs';

const argv = yargs
  .option('flush', {
    alias: 'f',
    type: 'boolean',
    description: 'Enable results flushing to disk',
    default: false,
  })
  .option('name', {
    alias: 'n',
    description: 'Name of the benchmark to run',
  })
  .option('docs', {
    alias: 'd',
    description: 'Override the number of documents to insert',
    type: 'number',
    default: 10000,
  })
  .help()
  .alias('help', 'h').argv;

export type DataContext = {
  // TODO: add data context, allow for more complex scenarios (e.g. with changes)
  // intervalMs?: number;
  // toAdd?: number;
  // toRemove?: number;
};

export interface MaggregorBenchmarkScenario {
  name: string;
  description: string;
  data?: DataContext;
  //
  /**
   * The treshold represents the percentage that Maggregor must be faster than MongoDB.
   * e.g. 0.1 means that Maggregor must be at least 10% faster than MongoDB.
   */
  expectedSpeedTreshold?: number;
  run: (client: MongoClient, db: string, collection: string) => Promise<void>;
}

export const allBenchmarks: MaggregorBenchmarkScenario[] = [
  scenario1,
  scenario2,
];

const toRun = argv.name
  ? allBenchmarks.filter((s) => s.name === argv.name)
  : allBenchmarks;

if (toRun.length === 0) {
  logger.error('No benchmarks found');
  process.exit(1);
}

if (argv.docs < 10000) {
  logger.warn(
    'The number of documents may be too low for accurate results. Recommended minimum: 10000.',
  );
}

runBenchmarks(toRun, {
  flushResults: argv.flush,
  totalDocs: argv.docs,
});
