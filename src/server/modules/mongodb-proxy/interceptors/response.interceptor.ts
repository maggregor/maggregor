import { PassThrough } from 'stream';
import { OP_MSG, decodeMessage } from '../protocol';
import { MsgResponse } from '../request-adapter';

export type ReplyInterceptorHook = (intercepted: MsgResponse) => Promise<void>;

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
    _encoding: unknown,
    callback: (err?: Error) => void,
  ): Promise<void> {
    const buffer = Buffer.from(chunk);
    try {
      const msg = decodeMessage(buffer);
      const requestID = msg.header.requestID;
      const responseTo = msg.header.responseTo;
      if (
        // Dirty condition to check if the message is a reply
        msg.header.opCode === OP_MSG &&
        msg.contents.sections.length > 0 &&
        msg.contents.sections[0].payload.hasOwnProperty('cursor')
      ) {
        const intercepted: MsgResponse = {
          requestID,
          responseTo,
          data: msg.contents.sections[0].payload.cursor.firstBatch,
        };
        for (const hook of this.hooks) {
          hook(intercepted);
        }
      }
    } catch (e) {}
    this.push(chunk);
    callback();
  }
}
