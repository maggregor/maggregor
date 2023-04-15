/// <reference types="node" />
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import { LoggerService } from '@/server/modules/logger/logger.service';
export declare class MongoDBListenerService extends EventEmitter {
    private readonly configService;
    private readonly logger;
    private client;
    constructor(configService: ConfigService, logger: LoggerService);
    private startListen;
}
