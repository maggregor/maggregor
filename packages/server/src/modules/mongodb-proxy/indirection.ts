import { ParseMessage, OpCode, FullMessage, OpMsg } from './parse';
import { Transform } from 'stream';
import net from 'net';
import { serialize } from 'bson';

export class IndirectionTransform extends Transform {
  socket: net.Socket;

  constructor(socket: net.Socket) {
    super();
    this.socket = socket;
  }

  async _transform(
    chunk: Uint8Array,
    encoding: unknown,
    callback: (err?: Error) => void,
  ): Promise<void> {
    const { msg } = (await ParseMessage(chunk)) as {
      msg: FullMessage;
      readBytes: number;
    };

    if (findAggregationPipeline(msg)) {
      console.log(`Aggregation pipeline detected (${msg.header.requestID})`);
    }
    this.push(chunk);
    callback();
  }
}

function findAggregationPipeline(
  msg: FullMessage,
): Array<{ [key: string]: string }> {
  const { opCode } = msg.header;
  const contents = msg.contents as OpMsg;
  if (opCode === OpCode.OP_MSG) {
    const query = contents as unknown as QueryAggregationMessage;
    return query.sections[0]?.body?.data?.pipeline;
  }
}

type QueryAggregationMessage = {
  sections: Array<{
    kind: string;
    body: {
      data: {
        aggregate: string;
        pipeline: Array<{
          [key: string]: string;
        }>;
      };
    };
  }>;
};
