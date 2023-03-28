import { Transform } from 'stream';
import net from 'net';
import { decode, encode } from './protocol';

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
    const buffer = Buffer.from(chunk);
    if (buffer.readUint32LE(12) === 2013) {
      // OP_MSG
      const msg = decode(buffer);
      const payload = msg.contents.sections[0].payload;
      const { pipeline } = payload;
      const requestID = msg.header.requestID;
      const collectionName = payload.aggregate;
      const dbName = payload.$db;
      if (pipeline) {
        // Aggregation pipeline detected
        console.log(
          `Aggregation pipeline detected (requestID=${requestID}): ${JSON.stringify(
            pipeline,
          )} on ${dbName}.${collectionName}`,
        );
        const results = buildAndEncodeResults(requestID, 'test', 'test', [
          { _id: 'test', a: 10 },
        ]);
        this.socket.write(results);
        return;
      }
    }
    this.push(chunk);
    callback();
  }
}

function buildAndEncodeResults(
  requestID: number,
  collectionName: string,
  dbName: string,
  data: any[],
): Buffer {
  return encode({
    header: {
      requestID: 0,
      responseTo: requestID,
      opCode: 2013, // OP_MSG
    },
    contents: {
      flagBits: 0,
      sections: [
        {
          kind: 0,
          payload: {
            cursor: {
              firstBatch: data,
              id: 0,
              ns: `${dbName}.${collectionName}`,
            },
            ok: 1,
          },
        },
      ],
    },
  });
}
