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
    const pipeline = findAggregationPipeline(msg);

    Buffer.from('aze');
    if (pipeline) {
      console.log(
        `Pipeline detected. Response to ${msg.header.requestID}. Sent fake response`,
      );

      const messageLength = 130;
      const requestID = 0;
      const responseTo = msg.header.requestID;
      const opCode = OpCode.OP_MSG;
      const flagBits = 0;

      const message = Uint32Array.from([
        messageLength,
        requestID,
        responseTo,
        opCode,
        flagBits,
        Buffer.from('Body'),
      ]);

      return;
    }
    this.push(chunk);
    callback();
  }
}

function encodeResult(
  responseTo: number,
  dbName: string,
  collectionName: string,
  data: any[],
) {
  return {
    header: {
      messageLength: 130,
      requestID: 0,
      responseTo: responseTo,
      opCode: 2013,
    },
    contents: {
      opCode: 'OP_MSG',
      flagBits: 0,
      sections: [
        {
          kind: 'Body',
          body: serialize({
            data: {
              cursor: {
                firstBatch: data,
                id: 0,
                ns: `${dbName}.${collectionName}`,
              },
              ok: 1,
            },
          }),
        },
      ],
      checksum: null,
    },
  };
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
