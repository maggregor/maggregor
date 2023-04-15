/// <reference types="node" />
import { PassThrough } from 'stream';
export type InterceptedReply = {
    requestID: number;
    responseTo: number;
    data: any;
};
export type ReplyInterceptorHook = (intercepted: InterceptedReply) => Promise<void>;
export declare class ReplyInterceptor extends PassThrough {
    hooks: ReplyInterceptorHook[];
    constructor();
    registerHook(hook: ReplyInterceptorHook): void;
    _transform(chunk: Uint8Array, encoding: unknown, callback: (err?: Error) => void): Promise<void>;
}
