import { serialize, deserialize } from 'bson';

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

export function encode(message: MongoDBMessage): Buffer {
  const sectionsBuffer = Buffer.concat(
    message.contents.sections.map((section) => {
      const kindBuffer = Buffer.from([section.kind]);
      const payloadBuffer = serialize(section.payload);
      return Buffer.concat([kindBuffer, payloadBuffer]);
    }),
  );

  const flagBitsBuffer = Buffer.alloc(4);
  flagBitsBuffer.writeInt32LE(message.contents.flagBits, 0);

  const headerBuffer = Buffer.alloc(16);
  headerBuffer.writeInt32LE(
    flagBitsBuffer.length + sectionsBuffer.length + 16,
    0,
  );
  headerBuffer.writeInt32LE(message.header.requestID, 4);
  headerBuffer.writeInt32LE(message.header.responseTo, 8);
  headerBuffer.writeInt32LE(message.header.opCode, 12);

  return Buffer.concat([headerBuffer, flagBitsBuffer, sectionsBuffer]);
}

export function decode(buffer: Buffer): MongoDBMessage {
  const header = {
    messageLength: buffer.readInt32LE(0),
    requestID: buffer.readInt32LE(4),
    responseTo: buffer.readInt32LE(8),
    opCode: buffer.readInt32LE(12),
  };

  const flagBits = buffer.readInt32LE(16);

  const sections: MongoDBSection[] = [];
  let offset = 20;

  while (offset < buffer.length) {
    const kind = buffer.readUInt8(offset) as 0 | 1;
    offset += 1;
    const payload = deserialize(buffer.slice(offset));
    sections.push({ kind, payload });
    offset += payload.length;
  }

  return {
    header: header,
    contents: {
      flagBits: flagBits,
      sections: sections,
    },
  };
}
