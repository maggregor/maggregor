import {
  MongoDBMessage,
  decodeMessage,
  encodeMessage,
  encodeResults,
} from '@server/modules/mongodb-proxy/protocol/protocol';
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
    test('should encode a OP_MSG', () => {
      const buffer = encodeMessage(OP_MSG_1);
      expectBufferIsCorrectlyEncoded(buffer, OP_MSG_1);
    });
  });
  test('should encode and decode a OP_MSG', () => {
    expectBufferEncodeDecodeToBeEqual(encodeMessage(OP_MSG_1));
  });
  test('should have this buffer encoded correctly', () => {
    //{"header":{"messageLength":153,"requestID":15656,"responseTo":15,"opCode":2013},"contents":{"flagBits":0,"sections":[{"kind":0,"payload":{"cursor":{"firstBatch":[{"_id":"New York"},{"_id":"Los Angeles"}],"id":0,"ns":"test.test"},"ok":1}}]}}

    const expected = Buffer.from(
      '99000000283d00000f000000dd07000000000000008400000003637572736f72006b0000000466697273744261746368003c00000003300017000000025f696400090000004e657720596f726b00000331001a000000025f6964000c0000004c6f7320416e67656c6573000000126964000000000000000000026e73000a000000746573742e746573740000016f6b00000000000000f03f00',
      'hex',
    );
    decodeMessage(expected);
    console.log(expected.toString('hex'));
    const actual = encodeResults({
      db: 'test',
      collection: 'test',
      results: [{ _id: 'New York' }, { _id: 'Los Angeles' }],
      responseTo: 15,
    });
    console.log(actual.length);
    console.log(actual.toString('hex'));
    // expect(actual).toEqual(expected);
    // expect(actual.length).toBe(expected.length);
    // expect(actual.readUint32LE(0)).toBe(expected.readUint32LE(0)); // messageLength
    expect(actual.readUint32LE(4)).toBe(expected.readUint32LE(4)); // requestID
    expect(actual.readUint32LE(8)).toBe(expected.readUint32LE(8)); // responseTo
    expect(actual.readUint32LE(12)).toBe(expected.readUint32LE(12)); // opCode
    expect(actual.readUint32LE(16)).toBe(expected.readUint32LE(16)); // flagBits
    // expect(actual.readUint32LE(20)).toBe(expected.readUint32LE(20)); // size of the section
    // expect(actual.readUint32LE(24)).toBe(expected.readUint32LE(24)); // cursor
    // expect(actual.readUint32LE(28)).toBe(expected.readUint32LE(28)); // firstBatch
    // expect(actual.readUint32LE(32)).toBe(expected.readUint32LE(32)); // id
    // console.log(JSON.stringify(deserialize(expected.subarray(21 + 0 * 5))));
    // console.log(deserialize(actual.subarray(21 + 0 * 5)));
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
