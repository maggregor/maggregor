/// <reference types="node" />
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import { AggregateInterceptorHook } from './interceptors/aggregate.interceptor';
import { ReplyInterceptorHook } from './interceptors/reply-interceptor';
import { RequestService } from '../request/request.service';
import { LoggerService } from '../logger/logger.service';
export type MongoDBProxyOptions = {
    targetHost: string;
    targetPort: number;
    listenHost: string;
    listenPort: number;
};
export interface MongoDBProxyListener {
    onAggregateQueryFromClient: AggregateInterceptorHook;
    onResultFromServer: ReplyInterceptorHook;
}
export interface TcpProxyEvents {
    listening: () => void;
    closed: () => void;
    error: (err: Error) => void;
}
export declare class MongoDBTcpProxyService extends EventEmitter {
    private readonly requestService;
    private readonly config;
    private readonly logger;
    private server;
    private options;
    constructor(requestService: RequestService, config: ConfigService, logger: LoggerService);
    init(): this;
    start(): void;
    stop(): void;
    getProxyPort(): number;
    getProxyHost(): string;
    getTargetHost(): string;
    getTargetPort(): number;
    private loadConfig;
}
