import { ChildProcess, spawn } from 'child_process';

export class MaggregorProcess {
  private process: ChildProcess;
  start() {
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
  }
  stop() {
    this.process && process.kill(-this.process.pid);
  }
}
