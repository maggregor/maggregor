/**
 * This script is used to run a Redis instance for testing purposes.
 *
 * Run this script with `ts-node scripts/run-redis.ts`.
 */

import waitPort from 'wait-port';
import { startRedisServer } from '../tests/e2e/utils';
import logger from '../tests/__utils__/logger';

const port = 6379;
waitPort({ port, timeout: 300, output: 'silent' }).then(
  ({ open }: { open: boolean }) => {
    if (open) {
      logger.error(`Port ${port} already used`);
      process.exit(1);
    }
    startRedisServer({
      instance: {
        port,
      },
    });
  },
);
