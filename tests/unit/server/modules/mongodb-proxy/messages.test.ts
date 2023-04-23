import {
  handleRequestPayload,
  MsgRequest,
} from '@server/modules/mongodb-proxy/messages';

describe('handleRequestPayload', () => {
  it('should handle find request', () => {
    const payload = {
      dbName: 'testDB',
      find: 'testCollection',
      filter: { field: 'value' },
    };
    const requestID = 1;

    const result = handleRequestPayload(requestID, payload);
    const expected: MsgRequest = {
      requestID,
      type: 'find',
      dbName: payload.dbName,
      collectionName: payload.find,
      filter: payload.filter,
    };

    expect(result).toEqual(expected);
  });

  it('should handle aggregate request', () => {
    const payload = {
      dbName: 'testDB',
      aggregate: 'testCollection',
      pipeline: [{ $match: { field: 'value' } }],
    };
    const requestID = 2;

    const result = handleRequestPayload(requestID, payload);
    const expected: MsgRequest = {
      requestID,
      type: 'aggregate',
      dbName: payload.dbName,
      collectionName: payload.aggregate,
      pipeline: payload.pipeline,
    };

    expect(result).toEqual(expected);
  });

  it('should handle count request', () => {
    const payload = {
      dbName: 'testDB',
      count: 'testCollection',
      query: { field: 'value' },
    };
    const requestID = 3;

    const result = handleRequestPayload(requestID, payload);
    const expected: MsgRequest = {
      requestID,
      type: 'count',
      dbName: payload.dbName,
      collectionName: payload.count,
      query: payload.query,
    };

    expect(result).toEqual(expected);
  });

  it('should throw error for unsupported message type', () => {
    const payload = {
      dbName: 'testDB',
    };
    const requestID = 4;

    expect(() => handleRequestPayload(requestID, payload)).toThrowError(
      'Unsupported message type',
    );
  });
});
