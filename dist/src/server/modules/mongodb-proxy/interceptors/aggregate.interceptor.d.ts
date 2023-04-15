/// <reference types="node" />
/// <reference types="node" />
import type net from 'net';
import type { MsgResult } from '../protocol';
import { Transform } from 'stream';
export type MsgAggregate = {
    requestID: number;
    dbName: string;
    collectionName: string;
    pipeline: any[];
};
export type AggregateInterceptorHook = (intercepted: MsgAggregate) => Promise<MsgResult>;
export declare class AggregateInterceptor extends Transform {
    socket: net.Socket;
    hooks: AggregateInterceptorHook[];
    constructor(socket: net.Socket);
    registerHook(hook: AggregateInterceptorHook): void;
    _transform(chunk: Uint8Array, encoding: unknown, callback: (err?: Error) => void): Promise<void>;
}
