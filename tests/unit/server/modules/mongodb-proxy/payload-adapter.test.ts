import {
  resolveRequestType,
  resolveRequest,
  RequestPayload,
} from '@/server/modules/mongodb-proxy/payload-resolver';
import { IRequest } from '@/server/modules/request/request.interface';

describe('handlePayload', () => {
  it('should return a find request', () => {
    const requestID = 1;
    const payload: RequestPayload = {
      $db: 'my-db',
      find: 'my-collection',
      filter: { field: 'value' },
    };
    const request = resolveRequest(requestID, payload);
    expect(request).toEqual({
      requestID,
      db: 'my-db',
      collName: 'my-collection',
      filter: { field: 'value' },
      limit: undefined,
      pipeline: undefined,
      query: undefined,
      requestSource: null,
      type: 'find',
    } as IRequest);
  });

  it('should return an aggregate request', () => {
    const requestID = 2;
    const payload: RequestPayload = {
      $db: 'my-db',
      aggregate: 'my-collection',
      pipeline: [{ $match: { field: 'value' } }],
    };
    const request = resolveRequest(requestID, payload);
    expect(request).toEqual({
      requestID,
      db: 'my-db',
      collName: 'my-collection',
      pipeline: [{ $match: { field: 'value' } }],
      filter: undefined,
      limit: undefined,
      query: undefined,
      requestSource: null,
      type: 'aggregate',
    } as IRequest);
  });

  it('should return a count request', () => {
    const requestID = 3;
    const payload: RequestPayload = {
      $db: 'my-db',
      count: 'my-collection',
      query: { field: 'value' },
    };
    const request = resolveRequest(requestID, payload);
    expect(request).toEqual({
      requestID,
      db: 'my-db',
      collName: 'my-collection',
      query: { field: 'value' },
      filter: undefined,
      limit: undefined,
      pipeline: undefined,
      requestSource: null,
      type: 'count',
    } as IRequest);
  });

  it('should return an unknown request', () => {
    const requestID = 4;
    const payload: any = {
      $db: 'my-db',
      unknownField: 'value',
    };
    const request = resolveRequest(requestID, payload);
    expect(request).toEqual({
      requestID,
      db: 'my-db',
      collName: undefined,
      filter: undefined,
      limit: undefined,
      pipeline: undefined,
      query: undefined,
      requestSource: null,
      type: 'unknown',
    } as IRequest);
  });
});

describe('resolveType', () => {
  it('should return find', () => {
    const payload: any = {
      find: 'my-collection',
    };
    const type = resolveRequestType(payload);
    expect(type).toEqual('find');
  });

  it('should return aggregate', () => {
    const payload: any = {
      aggregate: 'my-collection',
    };
    const type = resolveRequestType(payload);
    expect(type).toEqual('aggregate');
  });

  it('should return count', () => {
    const payload: any = {
      count: 'my-collection',
    };
    const type = resolveRequestType(payload);
    expect(type).toEqual('count');
  });

  it('should return unknown', () => {
    const payload: any = {
      unknownField: 'value',
    };
    const type = resolveRequestType(payload);
    expect(type).toEqual('unknown');
  });
});
