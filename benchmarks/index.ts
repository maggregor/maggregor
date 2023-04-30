import { MongoClient } from 'mongodb';
import { runBenchmarks } from './runner';
import scenario1 from './aggregate.scenario';
import scenario2 from './find.scenario';
import logger from '../tests/__utils__/logger';
import yargs from 'yargs';
import numeral from 'numeral';
import { ExpectedSpeedPercentage } from './expected-speed';

export const ALLOWED_NB_OF_DOCS = [0, 10, 100, 1000, 10000, 100000, 1000000];

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
    description: 'Choose the number of documents to generate',
    type: 'string',
    coerce: (value: any) => {
      const parsed = numeral(value).value();
      if (!parsed || !ALLOWED_NB_OF_DOCS.includes(parsed)) {
        throw new Error(
          'Number of documents must be one of ' +
            ALLOWED_NB_OF_DOCS.join(', ') +
            ' (or a string like 10k, 100k, 1m, etc.)',
        );
      }
      return parsed;
    },
    default: '100k',
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
   * The exp
   * e.g. 0.1 means that Maggregor must be at least 10% faster than MongoDB.
   */
  expectedSpeed?: ExpectedSpeedPercentage;
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

runBenchmarks(toRun, {
  flushResults: argv.flush,
  totalDocs: argv.docs,
});
