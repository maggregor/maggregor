import type net from 'net';
import { decodeMessage, encodeResults } from '../protocol';
import { Transform } from 'stream';
import { MsgResult, resolveRequest } from '../payload-resolver';
import { IRequest } from '../../request/request.interface';
import { Session } from '../proxy.service';

export type RequestInterceptorHook = (
  msg: IRequest,
  session: Session,
) => Promise<MsgResult>;

export class RequestInterceptor extends Transform {
  socket: net.Socket;
  hooks: RequestInterceptorHook[];
  session: Session;

  constructor(socket: net.Socket, session: Session) {
    super();
    this.socket = socket;
    this.session = session;
    this.hooks = [];
  }
  registerHook(hook: RequestInterceptorHook): void {
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
      const payload = msg.contents.sections[0].payload;

      const requestID = msg.header.requestID;
      const dbName = payload.$db;

      if (dbName && this.session.isConnected) {
        const handled = resolveRequest(requestID, payload);
        let result: MsgResult;

        // iterate through all hooks and execute them
        // if one of them returns a result, we stop the iteration and assign the result
        for (const hook of this.hooks) {
          result = await hook(handled, this.session);
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
