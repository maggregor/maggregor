/* eslint-disable no-console */

import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import chalk from 'chalk';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  private getTimeStamp(): string {
    const now = new Date();
    const year = now.getFullYear().toString().padStart(4, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const timestamp = `${year}-${month}-${day} ${hour}:${minute}`;
    return timestamp;
  }

  private buildMessage(color: string, message: string): string {
    const timestamp = chalk[color](`[${this.getTimeStamp()}]`);
    const ctx = this.context ? chalk.gray(`[${this.context}]`) : '';
    const msg = chalk[color](message);
    return `${timestamp} ${ctx} ${msg}`;
  }

  log(message: string) {
    console.log(this.buildMessage('white', message));
  }

  error(message: string) {
    console.error(this.buildMessage('red', message));
  }

  warn(message: string) {
    console.warn(this.buildMessage('yellow', message));
  }

  debug(message: string) {
    console.debug(this.buildMessage('blue', message));
  }

  verbose(message: string) {
    console.log(this.buildMessage('whiteBright', message));
  }

  success(message: string) {
    console.log(this.buildMessage('green', message));
  }
}
