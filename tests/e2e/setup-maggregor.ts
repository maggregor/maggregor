import { ChildProcess, spawn } from 'child_process';
import waitPort from 'wait-port';
import { config } from 'dotenv';

config({ path: '.env.test' });

const defaultParams: { port: number; host: string } = {
  host: 'localhost',
  port: parseInt(process.env.PROXY_PORT),
};

export class MaggregorProcess {
  private process: ChildProcess;
  async start(params: { port: number; host: string } = defaultParams) {
    console.debug(`Starting Maggregor on port ${params.port}...`);
    if (process.env.PNPM_HOME === undefined) {
      throw new Error('process.env.PNPM_HOME is undefined');
    }
    this.process = spawn(`${process.env.PNPM_HOME}/pnpm`, ['preview'], {
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });
    console.debug('Waiting for Maggregor to be ready...');
    await waitPort({ ...params, output: 'silent' });
    console.debug('Maggregor started.');
    return params;
  }
  stop() {
    this.process && process.kill(-this.process.pid);
    console.debug('Maggregor stopped.');
  }
}
