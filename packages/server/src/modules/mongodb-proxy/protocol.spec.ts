import { encode, decode } from './protocol';

describe('Protocol', () => {
  it('encode', () => {
    const buffer = encode({
      header: {
        requestID: 123,
        responseTo: 0,
        opCode: 2013, // OP_MSG
      },
      contents: {
        flagBits: 0,
        sections: [
          {
            kind: 0,
            payload: {
              data: {
                cursor: {
                  firstBatch: [{ _id: '1', name: 'test' }],
                  id: 0,
                  ns: `test.test`,
                },
                ok: 1,
              },
            },
          },
        ],
      },
    });
    expect(buffer.readInt32LE()).toEqual(135); // messageLength
    expect(buffer.readInt32LE(4)).toEqual(123); // requestID
    expect(buffer.readInt32LE(8)).toEqual(0); // responseTo
    expect(buffer.readInt32LE(12)).toEqual(2013); // OP_MSG
    expect(buffer.readInt32LE(16)).toEqual(0); // flagBits
    expect(buffer.readInt8(20)).toEqual(0); // kind
  });
});
