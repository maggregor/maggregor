import { ChildProcess, spawn } from 'child_process';
import waitPort from 'wait-port';
import { config } from 'dotenv';
import chalk from 'chalk';

config({ path: '.env.test' });

type MProcessParams = { port?: number; targetUri?: string };

const defaultParams: MProcessParams = {
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
    console.log('Target for Maggregor:', process.env.MONGODB_TARGET_URI);
    this.process = spawn(`${process.env.PNPM_HOME}/pnpm`, ['preview'], {
      detached: false,
      stdio: 'inherit',
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

  stop() {
    this.process && process.kill(-this.process.pid);
    this.debug('Process killed');
  }

  debug(msg: string) {
    console.debug(chalk.gray(`MAGGREGOR > ${msg}`));
  }

  warn(msg: string) {
    console.warn(chalk.yellow(`MAGGREGOR > ${msg}`));
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
