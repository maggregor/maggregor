import { ChildProcess, spawn } from 'child_process';
import waitPort from 'wait-port';
import { config } from 'dotenv';
import chalk from 'chalk';
import logger from '../__utils__/logger';
import axios from 'axios';
import path from 'path';

config({ path: '.env.test' });

type MProcessParams = {
  port?: number;
  httpPort?: number;
  targetUri?: string;
  ssl?: boolean;
};

const defaultParams: MProcessParams = {
  httpPort: parseInt(process.env.HTTP_PORT),
  port: parseInt(process.env.PROXY_PORT),
  targetUri: process.env.MONGODB_TARGET_URI,
  ssl: false,
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
    if (this.params.ssl) {
      this.debug('Using SSL');
      process.env.USE_SSL = 'true';
      const sslDir = path.join(__dirname, '..', '__utils__', 'ssl');
      process.env.SSL_KEY_PATH = `${sslDir}/key.pem`;
      process.env.SSL_CERT_PATH = `${sslDir}/cert.pem`;
      this.debug(`SSL_KEY_PATH=${process.env.SSL_KEY_PATH}`);
      this.debug(`SSL_CERT_PATH=${process.env.SSL_CERT_PATH}`);
    } else {
      process.env.USE_SSL = 'false';
      delete process.env.SSL_KEY_PATH;
      delete process.env.SSL_CERT_PATH;
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
    const url = new URL(process.env.MONGODB_TARGET_URI);
    url.hostname = 'localhost';
    url.port = this.params.port.toString();
    return url.toString();
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

  async countRequests() {
    const data = await axios.get(`${this.getHttpUri()}/requests/stats/count`);
    return data;
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
