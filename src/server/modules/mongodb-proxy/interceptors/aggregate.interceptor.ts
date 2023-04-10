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
    console.log('nouveau truc a parser');
    const buffer = Buffer.from(chunk);
    try {
      const msg = decodeMessage(buffer);
      console.log('=>', JSON.stringify(msg));

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
            let resultBuffer = encodeResults(result);
            resultBuffer = Buffer.concat([resultBuffer]);
            console.log('[MOI] Taille du buffer', resultBuffer.length);
            console.log(
              '[MOI] Contenu du buffer',
              resultBuffer.toString('hex'),
            );
            // console.log('Build', JSON.stringify(decodeMessage(resultBuffer)));
            this.socket.write(
              Buffer.from(
                '5a000000283d000032000000dd07000000000000004500000003637572736f7200300000000466697273744261746368000500000000106964000000000000000000026e73000a000000746573742e746573740000106f6b000100000000',
                'hex',
              ),
            );
            return;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    this.push(chunk);
    callback();
  }
}
