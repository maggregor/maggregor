import { MongoClient } from 'mongodb';
import { runBenchmarks } from './runner';
import scenario1 from './scenario1';
import scenario2 from './scenario2';

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

const filter = process.argv[2];
const toRun = allBenchmarks.filter((b) => (filter ? b.name === filter : true));

if (toRun.length === 0) {
  console.log('No benchmarks found');
  process.exit(1);
}

const names = toRun.map((b) => b.name).join(', ');
console.log(`${toRun.length} benchmark(s) found: ${names}.`);

runBenchmarks(toRun);
