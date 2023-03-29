import { MongoDBMessage, decodeMessage, encodeMessage } from './protocol';
import { deserialize } from 'bson';

const OP_MSG_1: MongoDBMessage = {
  header: {
    requestID: 123,
    responseTo: 0,
    opCode: 2013, // OP_MSG
  },
  contents: {
    flagBits: 0,
    sections: [
      {
        kind: 0, // Body section
        payload: {
          hello: 'world',
        },
      },
    ],
  },
};

describe('MongoDB wire protocol', () => {
  describe('encodeOpMessage', () => {
    it('should encode a OP_MSG', () => {
      const buffer = encodeMessage(OP_MSG_1);
      expectBufferIsCorrectlyEncoded(buffer, OP_MSG_1);
    });
  });
  it('should encode and decode a OP_MSG', () => {
    expectBufferEncodeDecodeToBeEqual(encodeMessage(OP_MSG_1));
  });
});

function expectBufferIsCorrectlyEncoded(
  actual: Buffer,
  expected: MongoDBMessage,
) {
  expect(actual.readUint32LE(4)).toBe(expected.header.requestID);
  expect(actual.readUint32LE(8)).toBe(expected.header.responseTo);
  expect(actual.readUint32LE(12)).toBe(expected.header.opCode);
  expect(actual.readUint32LE(16)).toBe(expected.contents.flagBits);
  expected.contents.sections.forEach((section, index) => {
    expect(actual.readUint8(20 + index * 5)).toBe(section.kind);
    expect(deserialize(actual.subarray(21 + index * 5))).toEqual(
      section.payload,
    );
  });
}

function expectBufferEncodeDecodeToBeEqual(buffer: Buffer) {
  const encodedBuffer = encodeMessage(decodeMessage(buffer));
  expect(encodedBuffer).toEqual(buffer);
}
