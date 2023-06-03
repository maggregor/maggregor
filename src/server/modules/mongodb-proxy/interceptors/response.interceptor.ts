import { PassThrough } from 'stream';
import { OP_MSG, decodeMessage } from '../protocol';
import { IResponse, resolveResponse } from '../payload-resolver';
import { Session } from '../proxy.service';

export type ResponseInterceptorHook = (
  intercepted: IResponse,
  session: Session,
) => Promise<void>;

export class ResponseInterceptor extends PassThrough {
  hooks: ResponseInterceptorHook[];
  session: Session;

  constructor(session: Session) {
    super();
    this.hooks = [];
    this.session = session;
  }

  registerHook(hook: ResponseInterceptorHook): void {
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
          hook(res, this.session);
        }
      }
    } catch (e) {}
    this.session.isConnected = true;
    this.push(chunk);
    callback();
  }
}
