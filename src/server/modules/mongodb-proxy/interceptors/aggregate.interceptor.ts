import { Transform } from 'stream';
import net from 'net';
import { MsgResult, decodeMessage, encodeResults } from '../protocol';

export type MsgAggregate = {
  requestID: number;
  dbName: string;
  collectionName: string;
  pipeline: any[];
};

export type AggregateInterceptorHook = (
  intercepted: MsgAggregate,
) => Promise<MsgResult>;

export class AggregateInterceptor extends Transform {
  socket: net.Socket;
  hooks: AggregateInterceptorHook[];

  constructor(socket: net.Socket) {
    super();
    this.socket = socket;
    this.hooks = [];
  }

  registerHook(hook: AggregateInterceptorHook): void {
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
        const intercepted: MsgAggregate = {
          requestID,
          dbName,
          collectionName,
          pipeline,
        };
        let result = null;
        // iterate through all hooks and execute them
        // if one of them returns a result, we stop the iteration and assign the result
        for (const hook of this.hooks) {
          result = await hook(intercepted);
          if (result) {
            const resultBuffer = encodeResults(result);
            this.socket.write(resultBuffer);
            break;
          }
        }
      }
    } catch (e) {}
    this.push(chunk);
    callback();
  }
}
