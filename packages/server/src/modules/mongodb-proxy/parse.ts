import zlib from 'zlib';
import { promisify, TextDecoder } from 'util';
import { deserialize } from 'bson';

export class MessageHeader {
  messageLength: number;
  requestID: number;
  responseTo: number;
  opCode: number;

  constructor(
    values: Pick<
      MessageHeader,
      'messageLength' | 'requestID' | 'responseTo' | 'opCode'
    >,
  ) {
    this.messageLength = values.messageLength;
    this.requestID = values.requestID;
    this.responseTo = values.responseTo;
    this.opCode = values.opCode;
  }

  static async Read(
    buf: Uint8Array,
  ): Promise<{ msg: MessageHeader; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, 4 * 4);
    return {
      msg: new this({
        messageLength: dv.getInt32(0, true),
        requestID: dv.getInt32(4, true),
        responseTo: dv.getInt32(8, true),
        opCode: dv.getInt32(12, true),
      }),
      readBytes: 4 * 4,
    };
  }
}

export class OpCode {
  static OP_MSG = 2013;
  static OP_REPLY = 1;
  static OP_UPDATE = 2001;
  static OP_INSERT = 2002;
  static OP_QUERY = 2004;
  static OP_GET_MORE = 2005;
  static OP_DELETE = 2006;
  static OP_KILL_CURSORS = 2007;
  static OP_COMPRESSED = 2012;

  static LookupOpCode(
    value: (typeof OpCode)[keyof OpCode],
  ): keyof OpCode | null {
    for (const key of Object.keys(OpCode) as (keyof OpCode)[]) {
      if (OpCode[key] === value) {
        return key;
      }
    }
    return null;
  }
}

type OpContents =
  | OpMsg
  | OpReply
  | OpUpdate
  | OpInsert
  | OpQuery
  | OpGetMore
  | OpDelete
  | OpKillCursors
  | OpCompressed
  | OpUnknown;

export class BSONBuffer {
  data: any;

  constructor(buf: Uint8Array) {
    this.data = deserialize(buf);
  }
}

export class OpMsgBodySection {
  kind = 'Body' as const;
  body: BSONBuffer;

  constructor(body: BSONBuffer) {
    this.body = body;
  }
}

export class OpMsgSecurityTokenSection {
  kind = 'SecurityToken' as const;
  body: BSONBuffer;

  constructor(body: BSONBuffer) {
    this.body = body;
  }
}

export class OpMsgDocumentSequenceSection {
  kind = 'DocumentSequence' as const;
  docSequenceId: string;
  objects: BSONBuffer[];

  constructor(docSequenceId: string, objects: BSONBuffer[]) {
    this.docSequenceId = docSequenceId;
    this.objects = objects;
  }
}

export class OpMsgUnknownSection {
  kind = 'Unknown' as const;
  kindByte: number;

  constructor(kindByte: number) {
    this.kindByte = kindByte;
  }
}

export class OpMsg {
  opCode = 'OP_MSG' as const;
  flagBits: number;
  sections: (
    | OpMsgBodySection
    | OpMsgDocumentSequenceSection
    | OpMsgSecurityTokenSection
    | OpMsgUnknownSection
  )[];
  checksum: number | null;

  constructor(values: Pick<OpMsg, 'flagBits' | 'sections' | 'checksum'>) {
    this.flagBits = values.flagBits;
    this.sections = values.sections;
    this.checksum = values.checksum;
  }

  static async Read(
    buf: Uint8Array,
    length: number,
  ): Promise<{ msg: OpMsg; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, length);
    const flagBits = dv.getUint32(0, true);
    const checksum = flagBits & 1 ? dv.getUint32(length - 4, true) : null;
    const sections: OpMsg['sections'] = [];
    let i: number;
    for (i = 4; i < (flagBits & 1 ? length - 4 : length); ) {
      const kind = dv.getUint8(i);
      switch (kind) {
        case 0:
          {
            const bsonSize = dv.getUint32(i + 1, true);
            sections.push(
              new OpMsgBodySection(
                new BSONBuffer(
                  new Uint8Array(dv.buffer, dv.byteOffset + i + 1, bsonSize),
                ),
              ),
            );
            i += 1 + bsonSize;
          }
          break;
        case 1:
          {
            const sectionSize = dv.getUint32(i + 1, true);
            const seqIdStart = i + 5;
            for (i = seqIdStart; i < seqIdStart - 4 + sectionSize; i++) {
              if (dv.getUint8(i) === 0) {
                break;
              }
            }
            const docSequenceId = new TextDecoder().decode(
              new Uint8Array(
                dv.buffer,
                dv.byteOffset + seqIdStart,
                i - 1 - seqIdStart,
              ),
            );
            const objects: BSONBuffer[] = [];
            for (i = i + 1; i < seqIdStart - 4 + sectionSize; ) {
              const bsonSize = dv.getUint32(i, true);
              objects.push(
                new BSONBuffer(
                  new Uint8Array(dv.buffer, dv.byteOffset + i, bsonSize),
                ),
              );
              i += bsonSize;
            }
            sections.push(
              new OpMsgDocumentSequenceSection(docSequenceId, objects),
            );
          }
          break;
        case 2:
          {
            const bsonSize = dv.getUint32(i + 1, true);
            sections.push(
              new OpMsgSecurityTokenSection(
                new BSONBuffer(
                  new Uint8Array(dv.buffer, dv.byteOffset + i + 1, bsonSize),
                ),
              ),
            );
            i += 1 + bsonSize;
          }
          break;
        default: {
          sections.push(new OpMsgUnknownSection(kind));
          i = length;
          break;
        }
      }
    }

    return {
      msg: new this({
        flagBits,
        sections,
        checksum,
      }),
      readBytes: i + (flagBits & 1) ? 4 : 0,
    };
  }
}

export class OpUpdate {
  opCode = 'OP_UPDATE' as const;
  fullCollectionName: string;
  flags: number;
  selector: BSONBuffer;
  update: BSONBuffer;

  constructor(
    values: Pick<
      OpUpdate,
      'fullCollectionName' | 'flags' | 'selector' | 'update'
    >,
  ) {
    this.fullCollectionName = values.fullCollectionName;
    this.flags = values.flags;
    this.selector = values.selector;
    this.update = values.update;
  }

  static async Read(
    buf: Uint8Array,
    length: number,
  ): Promise<{ msg: OpUpdate; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, length);
    let i;
    for (i = 4; i < length; i++) {
      if (dv.getUint8(i) === 0) {
        break;
      }
    }
    const fullCollectionName = new TextDecoder().decode(
      new Uint8Array(dv.buffer, dv.byteOffset + 4, i - 4),
    );
    i++;
    const flags = dv.getInt32(i, true);
    let selector: BSONBuffer;
    let update: BSONBuffer;
    {
      const bsonSize = dv.getUint32(i, true);
      selector = new BSONBuffer(
        new Uint8Array(dv.buffer, dv.byteOffset + i, bsonSize),
      );
      i += bsonSize;
    }
    {
      const bsonSize = dv.getUint32(i, true);
      update = new BSONBuffer(
        new Uint8Array(dv.buffer, dv.byteOffset + i, bsonSize),
      );
      i += bsonSize;
    }

    return {
      msg: new this({
        fullCollectionName,
        flags,
        selector,
        update,
      }),
      readBytes: i,
    };
  }
}

export class OpInsert {
  opCode = 'OP_INSERT' as const;
  fullCollectionName: string;
  flags: number;
  documents: BSONBuffer[];

  constructor(
    values: Pick<OpInsert, 'fullCollectionName' | 'flags' | 'documents'>,
  ) {
    this.fullCollectionName = values.fullCollectionName;
    this.flags = values.flags;
    this.documents = values.documents;
  }

  static async Read(
    buf: Uint8Array,
    length: number,
  ): Promise<{ msg: OpInsert; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, length);
    let i = 0;
    const flags = dv.getInt32(i, true);
    for (i = 4; i < length; i++) {
      if (dv.getUint8(i) === 0) {
        break;
      }
    }
    const fullCollectionName = new TextDecoder().decode(
      new Uint8Array(dv.buffer, dv.byteOffset + 4, i - 4),
    );
    i++;
    const documents: BSONBuffer[] = [];
    while (i < length) {
      const bsonSize = dv.getUint32(i, true);
      documents.push(
        new BSONBuffer(new Uint8Array(dv.buffer, dv.byteOffset + i, bsonSize)),
      );
      i += bsonSize;
    }

    return {
      msg: new this({
        fullCollectionName,
        flags,
        documents,
      }),
      readBytes: i,
    };
  }
}

export class OpQuery {
  opCode = 'OP_QUERY' as const;
  fullCollectionName: string;
  flags: number;
  numberToSkip: number;
  numberToReturn: number;
  query: BSONBuffer;
  returnFieldsSelector: BSONBuffer | null;

  constructor(
    values: Pick<
      OpQuery,
      | 'fullCollectionName'
      | 'flags'
      | 'numberToSkip'
      | 'numberToReturn'
      | 'query'
      | 'returnFieldsSelector'
    >,
  ) {
    this.fullCollectionName = values.fullCollectionName;
    this.flags = values.flags;
    this.numberToSkip = values.numberToSkip;
    this.numberToReturn = values.numberToReturn;
    this.query = values.query;
    this.returnFieldsSelector = values.returnFieldsSelector;
  }

  static async Read(
    buf: Uint8Array,
    length: number,
  ): Promise<{ msg: OpQuery; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, length);
    let i = 0;
    const flags = dv.getInt32(i, true);
    for (i = 4; i < length; i++) {
      if (dv.getUint8(i) === 0) {
        break;
      }
    }
    const fullCollectionName = new TextDecoder().decode(
      new Uint8Array(dv.buffer, dv.byteOffset + 4, i - 4),
    );
    i++;

    const numberToSkip = dv.getInt32(i, true);
    i += 4;
    const numberToReturn = dv.getInt32(i, true);
    i += 4;

    let query: BSONBuffer;
    let returnFieldsSelector: BSONBuffer | null = null;
    {
      const bsonSize = dv.getUint32(i, true);
      query = new BSONBuffer(
        new Uint8Array(dv.buffer, dv.byteOffset + i, bsonSize),
      );
      i += bsonSize;
    }
    if (i < length) {
      const bsonSize = dv.getUint32(i, true);
      returnFieldsSelector = new BSONBuffer(
        new Uint8Array(dv.buffer, dv.byteOffset + i, bsonSize),
      );
      i += bsonSize;
    }

    return {
      msg: new this({
        fullCollectionName,
        flags,
        numberToSkip,
        numberToReturn,
        query,
        returnFieldsSelector,
      }),
      readBytes: i,
    };
  }
}

export class OpGetMore {
  opCode = 'OP_GET_MORE' as const;
  fullCollectionName: string;
  numberToReturn: number;
  cursorId: string;

  constructor(
    values: Pick<
      OpGetMore,
      'fullCollectionName' | 'numberToReturn' | 'cursorId'
    >,
  ) {
    this.fullCollectionName = values.fullCollectionName;
    this.numberToReturn = values.numberToReturn;
    this.cursorId = values.cursorId;
  }

  static async Read(
    buf: Uint8Array,
    length: number,
  ): Promise<{ msg: OpGetMore; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, length);
    let i;
    for (i = 4; i < length; i++) {
      if (dv.getUint8(i) === 0) {
        break;
      }
    }
    const fullCollectionName = new TextDecoder().decode(
      new Uint8Array(dv.buffer, dv.byteOffset + 4, i - 4),
    );
    i++;

    const numberToReturn = dv.getInt32(i, true);
    i += 4;
    const cursorId = String(dv.getBigInt64(i, true));
    i += 8;

    return {
      msg: new this({
        fullCollectionName,
        numberToReturn,
        cursorId,
      }),
      readBytes: i,
    };
  }
}

export class OpDelete {
  opCode = 'OP_DELETE' as const;
  fullCollectionName: string;
  flags: number;
  selector: BSONBuffer;

  constructor(
    values: Pick<OpDelete, 'fullCollectionName' | 'flags' | 'selector'>,
  ) {
    this.fullCollectionName = values.fullCollectionName;
    this.flags = values.flags;
    this.selector = values.selector;
  }

  static async Read(
    buf: Uint8Array,
    length: number,
  ): Promise<{ msg: OpDelete; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, length);
    let i;
    for (i = 4; i < length; i++) {
      if (dv.getUint8(i) === 0) {
        break;
      }
    }
    const fullCollectionName = new TextDecoder().decode(
      new Uint8Array(dv.buffer, dv.byteOffset + 4, i - 4),
    );
    i++;

    const flags = dv.getInt32(i, true);
    i += 4;

    let selector: BSONBuffer;
    {
      const bsonSize = dv.getUint32(i, true);
      selector = new BSONBuffer(
        new Uint8Array(dv.buffer, dv.byteOffset + i, bsonSize),
      );
      i += bsonSize;
    }

    return {
      msg: new this({
        fullCollectionName,
        flags,
        selector,
      }),
      readBytes: i,
    };
  }
}

export class OpKillCursors {
  opCode = 'OP_KILL_CURSORS' as const;
  cursorIds: string[];

  constructor(values: Pick<OpKillCursors, 'cursorIds'>) {
    this.cursorIds = values.cursorIds;
  }

  static async Read(
    buf: Uint8Array,
    length: number,
  ): Promise<{ msg: OpKillCursors; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, length);
    const n = dv.getInt32(4, true);
    const cursorIds: string[] = [];
    let i;
    for (i = 8; i - 8 < n * 8; i += 8) {
      cursorIds.push(String(dv.getBigInt64(i, true)));
    }

    return {
      msg: new this({
        cursorIds,
      }),
      readBytes: i,
    };
  }
}

export class OpCompressed {
  opCode = 'OP_COMPRESSED' as const;
  originalOpcode: number;
  compressorId: string;
  contents: OpContents | Uint8Array;

  constructor(
    values: Pick<OpCompressed, 'originalOpcode' | 'compressorId' | 'contents'>,
  ) {
    this.originalOpcode = values.originalOpcode;
    this.compressorId = values.compressorId;
    this.contents = values.contents;
  }

  static async Read(
    buf: Uint8Array,
    length: number,
  ): Promise<{ msg: OpCompressed; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, length);
    const originalOpcode = dv.getInt32(0, true);
    const compressorIdN = dv.getUint8(8);
    let compressorId: string;
    switch (compressorIdN) {
      case 0:
        compressorId = 'noop';
        break;
      case 1:
        compressorId = 'snappy';
        break;
      case 2:
        compressorId = 'zlib';
        break;
      case 3:
        compressorId = 'zstd';
        break;
      default:
        compressorId = `unknown (${compressorIdN})`;
        break;
    }

    const compressed = new Uint8Array(dv.buffer, dv.byteOffset + 9, length - 9);
    let uncompressed: Uint8Array | null = null;
    if (compressorId === 'noop') {
      uncompressed = compressed;
    } else if (compressorId === 'zlib') {
      uncompressed = await promisify(zlib.inflate)(compressed);
    }

    let contents: OpContents | Uint8Array;
    if (uncompressed === null) {
      contents = compressed;
    } else {
      contents = (
        await ReadOpContents(originalOpcode, uncompressed, uncompressed.length)
      ).msg;
    }

    return {
      msg: new this({
        originalOpcode,
        compressorId,
        contents,
      }),
      readBytes: length,
    };
  }
}

export class OpReply {
  opCode = 'OP_REPLY' as const;
  flags: number;
  cursorId: string;
  startingFrom: number;
  numberReturned: number;
  documents: BSONBuffer[];

  constructor(
    values: Pick<
      OpReply,
      'flags' | 'cursorId' | 'startingFrom' | 'numberReturned' | 'documents'
    >,
  ) {
    this.flags = values.flags;
    this.cursorId = values.cursorId;
    this.startingFrom = values.startingFrom;
    this.numberReturned = values.numberReturned;
    this.documents = values.documents;
  }

  static async Read(
    buf: Uint8Array,
    length: number,
  ): Promise<{ msg: OpReply; readBytes: number }> {
    const dv = new DataView(buf.buffer, buf.byteOffset, length);
    let i = 0;
    const flags = dv.getInt32(i, true);
    i += 4;
    const cursorId = String(dv.getBigUint64(i, true));
    i += 8;
    const startingFrom = dv.getInt32(i, true);
    i += 4;
    const numberReturned = dv.getInt32(i, true);
    i += 4;

    const documents: BSONBuffer[] = [];
    while (i < length) {
      const bsonSize = dv.getUint32(i, true);
      documents.push(
        new BSONBuffer(new Uint8Array(dv.buffer, dv.byteOffset + i, bsonSize)),
      );
      i += bsonSize;
    }

    return {
      msg: new this({
        flags,
        cursorId,
        startingFrom,
        numberReturned,
        documents,
      }),
      readBytes: i,
    };
  }
}

export class OpUnknown {
  opCode = 'OP_UNKNOWN' as const;
  actualOpCode: number;
  body: Uint8Array;

  constructor(values: Pick<OpUnknown, 'actualOpCode' | 'body'>) {
    this.actualOpCode = values.actualOpCode;
    this.body = values.body;
  }
}

async function ReadOpContents(
  opcode: number,
  data: Uint8Array,
  length: number,
): Promise<{ msg: OpContents; readBytes: number }> {
  switch (opcode) {
    case OpCode.OP_MSG:
      return OpMsg.Read(data, length);
    case OpCode.OP_REPLY:
      return OpReply.Read(data, length);
    case OpCode.OP_UPDATE:
      return OpUpdate.Read(data, length);
    case OpCode.OP_INSERT:
      return OpInsert.Read(data, length);
    case OpCode.OP_QUERY:
      return OpQuery.Read(data, length);
    case OpCode.OP_GET_MORE:
      return OpGetMore.Read(data, length);
    case OpCode.OP_DELETE:
      return OpDelete.Read(data, length);
    case OpCode.OP_KILL_CURSORS:
      return OpKillCursors.Read(data, length);
    case OpCode.OP_COMPRESSED:
      return OpCompressed.Read(data, length);
    default: {
      return {
        msg: new OpUnknown({
          actualOpCode: opcode,
          body: data.subarray(0, length),
        }),
        readBytes: length,
      };
    }
  }
}

export class FullMessage {
  header: MessageHeader;
  contents: OpContents;

  constructor(header: MessageHeader, contents: OpContents) {
    this.header = header;
    this.contents = contents;
  }
}

export async function ParseMessage(
  data: Uint8Array,
): Promise<{ msg: FullMessage; readBytes: number } | { needBytes: number }> {
  if (data.length < 16) {
    return { needBytes: 16 };
  }

  const { msg: header, readBytes: headerBytes } = await MessageHeader.Read(
    data,
  );
  if (header.messageLength > data.length) {
    return { needBytes: data.length - header.messageLength };
  }
  const contents = (
    await ReadOpContents(
      header.opCode,
      data.subarray(headerBytes, header.messageLength),
      header.messageLength - headerBytes,
    )
  ).msg;
  return {
    msg: new FullMessage(header, contents),
    readBytes: header.messageLength,
  };
}
