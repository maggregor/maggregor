import { MongoClient } from 'mongodb';
import { runBenchmarks } from './runner';
import scenario1 from './scenario1';
import scenario2 from './scenario2';
import logger from '../tests/__utils__/logger';
import yargs from 'yargs';

const argv = yargs
  .option('output', {
    alias: 'o',
    type: 'boolean',
    description: 'Enable output results to file',
    default: false,
  })
  .option('name', {
    alias: 'n',
    description: 'Name of the benchmark to run',
  })
  .help()
  .alias('help', 'h').argv;

export type DataContext = {
  start: number;
  // TODO: add more data context, allow for more complex scenarios (e.g. with changes)
  // intervalMs?: number;
  // toAdd?: number;
};

export interface MaggregorBenchmarkScenario {
  name: string;
  description: string;
  data: DataContext;
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

runBenchmarks(toRun, argv.output);
