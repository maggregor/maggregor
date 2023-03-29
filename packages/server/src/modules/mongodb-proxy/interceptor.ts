import { Transform } from 'stream';
import net from 'net';
import { MessageResultConfig, decodeMessage, encodeResults } from './protocol';

export type InterceptedPipeline = {
  requestID: number;
  dbName: string;
  collectionName: string;
  pipeline: any[];
};

export type InterceptorHook = (
  intercepted: InterceptedPipeline,
) => Promise<MessageResultConfig>;

export class PipelineInterceptor extends Transform {
  socket: net.Socket;
  hooks: InterceptorHook[];

  constructor(socket: net.Socket) {
    super();
    this.socket = socket;
    this.hooks = [];
  }

  registerHook(hook: InterceptorHook): void {
    this.hooks.push(hook);
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
        const intercepted: InterceptedPipeline = {
          requestID,
          dbName,
          collectionName,
          pipeline,
        };
        let result: any;
        for (const hook of this.hooks) {
          result = await hook(intercepted);
          if (result) {
            break;
          }
        }
        if (result) {
          // Send the result to the socket
          const resultBuffer = encodeResults(result);
          this.socket.write(resultBuffer);
          return;
        }
      }
    } catch (e) {}
    this.push(chunk);
    callback();
  }
}
