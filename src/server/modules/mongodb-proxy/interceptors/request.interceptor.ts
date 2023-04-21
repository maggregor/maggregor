import type net from 'net';
import type { MsgResult } from '../protocol';
import { decodeMessage, encodeResults } from '../protocol';
import { Transform } from 'stream';

export type MsgRequest = {
  requestID: number;
  dbName: string;
  collectionName: string;
  pipeline: any[];
};

export type RequestInterceptorHook = (
  intercepted: MsgRequest,
) => Promise<MsgResult>;

export class RequestInterceptor extends Transform {
  socket: net.Socket;
  hooks: RequestInterceptorHook[];

  constructor(socket: net.Socket) {
    super();
    this.socket = socket;
    this.hooks = [];
  }

  registerHook(hook: RequestInterceptorHook): void {
    hook && this.hooks.push(hook);
  }

  async _transform(
    chunk: Uint8Array,
    encoding: unknown,
    callback: (err?: Error) => void,
  ): Promise<void> {
    const buffer = Buffer.from(chunk);
    try {
      const msg = decodeMessage(buffer);
      const payload = msg.contents.sections[0].payload;
      const { pipeline } = payload;
      const requestID = msg.header.requestID;
      const collectionName = payload.aggregate;
      const dbName = payload.$db;
      if (pipeline) {
        const intercepted: MsgRequest = {
          requestID,
          dbName,
          collectionName,
          pipeline,
        };
        let result: MsgResult;
        // iterate through all hooks and execute them
        // if one of them returns a result, we stop the iteration and assign the result
        for (const hook of this.hooks) {
          result = await hook(intercepted);
          if (result) {
            const resultBuffer = encodeResults(result);
            this.socket.write(resultBuffer);
            callback();
            return;
          }
        }
      }
    } catch (e) {}
    this.push(chunk);
    callback();
  }
}
