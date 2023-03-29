import { serialize, deserialize } from 'bson';

// https://docs.mongodb.com/manual/reference/mongodb-wire-protocol/#op-query
const OP_REPLY = 1;
const OP_QUERY = 2004;
const OP_MSG = 2013;
const OP_COMPRESSED = 2012;

type MongoDBSection = {
  kind: 0 | 1;
  payload: any;
};

type MongoDBMessage = {
  header: {
    messageLength?: number;
    requestID: number;
    responseTo: number;
    opCode: number;
  };
  contents: {
    flagBits: number;
    sections: MongoDBSection[];
    checksum?: number;
  };
};

function encodeHeader(
  header: MongoDBMessage['header'],
  extraLength = 0,
): Buffer {
  const headerBuffer = Buffer.alloc(16);
  headerBuffer.writeInt32LE(16 + extraLength, 0);
  headerBuffer.writeInt32LE(header.requestID, 4);
  headerBuffer.writeInt32LE(header.responseTo, 8);
  headerBuffer.writeInt32LE(header.opCode, 12);
  return headerBuffer;
}

function decodeHeader(buffer: Buffer): MongoDBMessage['header'] {
  return {
    messageLength: buffer.readInt32LE(0),
    requestID: buffer.readInt32LE(4),
    responseTo: buffer.readInt32LE(8),
    opCode: buffer.readInt32LE(12),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function encodeOpQuery(message: MongoDBMessage): Buffer {
  throw new Error('Not implemented');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodeOpQuery(buffer: Buffer): MongoDBMessage {
  throw new Error('Not implemented');
}

function encodeOpMsg(message: MongoDBMessage): Buffer {
  const sectionsBuffer = Buffer.concat(
    message.contents.sections.map((section) => {
      const kindBuffer = Buffer.from([section.kind]);
      const payloadBuffer = serialize(section.payload);
      return Buffer.concat([kindBuffer, payloadBuffer]);
    }),
  );

  const flagBitsBuffer = Buffer.alloc(4);
  flagBitsBuffer.writeInt32LE(message.contents.flagBits, 0);

  const headerBuffer = encodeHeader(
    message.header,
    flagBitsBuffer.length + sectionsBuffer.length,
  );

  return Buffer.concat([headerBuffer, flagBitsBuffer, sectionsBuffer]);
}

function decodeOpMsg(buffer: Buffer): MongoDBMessage {
  const header = decodeHeader(buffer);
  const flagBits = buffer.readInt32LE(16);
  const sections: MongoDBSection[] = [];
  let offset = 20;
  while (offset < buffer.length) {
    const kind = buffer.readInt8(offset);
    offset += 1;
    const payload = deserialize(buffer.slice(offset));
    if (kind !== 0 && kind !== 1) {
      throw new Error(`Unknown section kind: ${kind}`);
    }
    sections.push({ kind, payload });
    offset += payload.length;
  }
  return {
    header,
    contents: {
      flagBits,
      sections,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function encodeOpCompressed(message: MongoDBMessage): Buffer {
  throw new Error('Not implemented');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodeOpCompressed(buffer: Buffer): MongoDBMessage {
  throw new Error('Not implemented');
}

function encodeMessage(message: MongoDBMessage): Buffer {
  switch (message.header.opCode) {
    case OP_QUERY:
      return encodeOpQuery(message);
    case OP_MSG:
      return encodeOpMsg(message);
    case OP_COMPRESSED:
      return encodeOpCompressed(message);
    default:
      throw new Error(`Unknown opCode: ${message.header.opCode}`);
  }
}

export type MessageResultConfig = {
  db: string;
  collection: string;
  results: any[];
  responseTo: number;
};

function encodeResults(config: MessageResultConfig): Buffer {
  const sections: MongoDBSection[] = [
    {
      kind: 1,
      payload: {
        cursor: {
          id: 0,
          ns: `${config.db}.${config.collection}`,
          firstBatch: config.results,
        },
      },
    },
  ];
  return encodeMessage({
    header: {
      requestID: 0, // Not used
      responseTo: config.responseTo,
      opCode: OP_MSG,
    },
    contents: {
      flagBits: 0,
      sections,
    },
  });
}

function decodeMessage(buffer: Buffer): MongoDBMessage {
  const opCode = buffer.readInt32LE(12);
  switch (opCode) {
    case OP_QUERY:
      return decodeOpQuery(buffer);
    case OP_MSG:
      return decodeOpMsg(buffer);
    case OP_COMPRESSED:
      return decodeOpCompressed(buffer);
    case OP_REPLY:
      return decodeOpReply(buffer);
    default:
      throw new Error(`Unknown opCode: ${opCode}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodeOpReply(buffer: Buffer): MongoDBMessage {
  throw new Error('Not implemented');
}

export {
  OP_QUERY,
  OP_MSG,
  OP_COMPRESSED,
  OP_REPLY,
  encodeMessage,
  decodeMessage,
  encodeResults,
  MongoDBMessage,
  MongoDBSection,
};
