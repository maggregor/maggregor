import { encode, decode } from './protocol';

describe('Protocol', () => {
  it('encode', () => {
    const buffer = encode({
      header: {
        messageLength: 0,
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
    expect(buffer.readInt32LE()).toEqual(135);
  });
});
