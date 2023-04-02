import { PassThrough } from 'stream';
import { OP_MSG, OP_QUERY, OP_REPLY, decodeMessage } from '../protocol';

export type InterceptedReply = {
  requestID: number;
  responseTo: number;
};

export type ReplyInterceptorHook = (
  intercepted: InterceptedReply,
) => Promise<void>;

export class ReplyInterceptor extends PassThrough {
  hooks: ReplyInterceptorHook[];

  constructor() {
    super();
    this.hooks = [];
  }

  registerHook(hook: ReplyInterceptorHook): void {
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
      const requestID = msg.header.requestID;
      const responseTo = msg.header.responseTo;
      if (msg.header.opCode === OP_MSG) {
        const intercepted: InterceptedReply = {
          requestID,
          responseTo,
        };
        for (const hook of this.hooks) {
          await hook(intercepted);
        }
      }
    } catch (e) {}
    this.push(chunk);
    callback();
  }
}
