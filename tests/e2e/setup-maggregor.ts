import { ChildProcess, spawn } from 'child_process';
import waitPort from 'wait-port';
import { config } from 'dotenv';
import chalk from 'chalk';
import logger from '../__utils__/logger';
import axios from 'axios';

config({ path: '.env.test' });

type MProcessParams = { port?: number; httpPort?: number; targetUri?: string };

const defaultParams: MProcessParams = {
  httpPort: parseInt(process.env.HTTP_PORT),
  port: parseInt(process.env.PROXY_PORT),
  targetUri: process.env.MONGODB_TARGET_URI,
};

export class MaggregorProcess {
  private process: ChildProcess;
  private params: MProcessParams;

  constructor(params: MProcessParams = defaultParams) {
    this.params = { ...defaultParams, ...params };
    process.env.MONGODB_TARGET_URI =
      this.params.targetUri || process.env.MONGODB_TARGET_URI;
    process.env.PROXY_PORT = this.params.port.toString();
    process.env.HTTP_PORT = this.params.httpPort.toString();
  }

  async start() {
    this.debug(`Starting Maggregor process on port ${this.params.port}...`);
    if (await this.processAlreadyStarted()) {
      this.warn('Process already started or port already in use. Aborting');
      process.exit(1);
    }
    if (process.env.PNPM_HOME === undefined) {
      throw new Error('process.env.PNPM_HOME is undefined');
    }
    this.process = spawn(`${process.env.PNPM_HOME}/pnpm`, ['preview'], {
      // Must to be detached=true to kill the process tree
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });
    this.debug('Waiting for server to be ready...');
    await waitPort({ port: this.params.port, output: 'silent' });
    this.debug('Server started & ready');
    return this;
  }

  getUri() {
    return `mongodb://localhost:${this.params.port}`;
  }

  getHttpUri() {
    return `http://localhost:${this.params.httpPort}`;
  }

  stop() {
    this.process && process.kill(-this.process.pid);
    this.debug('Process killed');
  }

  debug(msg: string) {
    logger.debug(chalk.gray(`[Maggregor] ${msg}`));
  }

  warn(msg: string) {
    logger.warn(chalk.yellow(`[Maggregor] ${msg}`));
  }

  async clearDatabase() {
    await axios.delete(`${this.getHttpUri()}/requests`);
  }

  async processAlreadyStarted(): Promise<boolean> {
    const timeout = 300;
    const { port } = this.params;
    return (await waitPort({ port, timeout, output: 'silent' })).open;
  }
}

export function startMaggregor(params: MProcessParams = defaultParams) {
  return new MaggregorProcess(params).start();
}
