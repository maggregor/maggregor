import { ChildProcess, spawn } from 'child_process';
import waitPort from 'wait-port';
import { config } from 'dotenv';
import chalk from 'chalk';

config({ path: '.env.test' });

type MProcessParams = { port: number; host: string };

const defaultParams: MProcessParams = {
  host: 'localhost',
  port: parseInt(process.env.PROXY_PORT),
};

export class MaggregorProcess {
  private process: ChildProcess;
  private params: MProcessParams;

  constructor(params: MProcessParams = defaultParams) {
    this.params = { ...defaultParams, ...params };
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
      detached: true,
      // stdio: 'ignore',
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });
    this.debug('Waiting for server to be ready...');
    await waitPort({ ...this.params, output: 'silent' });
    this.debug('Server started & ready');
    return this;
  }

  get processParams() {
    return this.params;
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
