import { PassThrough } from 'stream';
import { OP_MSG, decodeMessage } from '../protocol';
import { IResponse, resolveResponse } from '../payload-resolver';

export type ReplyInterceptorHook = (intercepted: IResponse) => Promise<void>;

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

      const payload = msg.contents.sections[0].payload;
      if (msg.header.opCode === OP_MSG) {
        const res: IResponse = resolveResponse(requestID, responseTo, payload);
        for (const hook of this.hooks) {
          hook(res);
        }
      }
    } catch (e) {}
    this.push(chunk);
    callback();
  }
}
