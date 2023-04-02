import { PassThrough } from 'stream';
import { OP_MSG, OP_QUERY, OP_REPLY, decodeMessage } from '../protocol';
import { Logger } from '@nestjs/common';

export type InterceptedReply = {
  requestID: number;
  responseTo: number;
  data: any;
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
      if (
        msg.header.opCode === OP_MSG &&
        msg.contents.sections.length > 0 &&
        msg.contents.sections[0].payload.hasOwnProperty('cursor')
      ) {
        const intercepted: InterceptedReply = {
          requestID,
          responseTo,
          data: msg.contents.sections[0].payload.cursor.firstBatch,
        };
        for (const hook of this.hooks) {
          await hook(intercepted);
        }
      }
    } catch (e) {
      console.error(e);
    }
    this.push(chunk);
    callback();
  }
}
