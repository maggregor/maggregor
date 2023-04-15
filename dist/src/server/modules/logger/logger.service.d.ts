import { ConsoleLogger } from '@nestjs/common';
export declare class LoggerService extends ConsoleLogger {
    private getTimeStamp;
    private buildMessage;
    log(message: string): void;
    error(message: string): void;
    warn(message: string): void;
    debug(message: string): void;
    verbose(message: string): void;
    success(message: string): void;
}
