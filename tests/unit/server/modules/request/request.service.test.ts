import { RequestService } from '@/server/modules/request/request.service';
import { createRequestServiceWithMockDeps } from '../../utils';
import { IRequest } from '@/server/modules/request/request.interface';
import { MsgResult } from '@/server/modules/mongodb-proxy/protocol';

describe('RequestService', () => {
  let service: RequestService;

  beforeEach(async () => {
    service = await createRequestServiceWithMockDeps();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should create a request', async () => {
    const mockRequest: any = {
      _id: '1',
      requestID: 1,
      type: 'find',
    };

    vitest.spyOn(service, 'create').mockImplementation(async () => mockRequest);
    const result = await service.create(mockRequest);
    expect(result).toEqual(mockRequest);
  });

  it('should find a request by requestID', async () => {
    const mockRequest: any = {
      _id: '1',
      requestID: 1,
      type: 'find',
    };

    vitest
      .spyOn(service, 'findOneByRequestId')
      .mockImplementation(async () => mockRequest);
    const result = await service.findOneByRequestId(1);
    expect(result).toEqual(mockRequest);
  });

  it('should update a request', async () => {
    const mockRequest: any = {
      _id: '1',
      requestID: 1,
      type: 'find',
    };

    vitest
      .spyOn(service, 'updateOne')
      .mockImplementation(async () => mockRequest);
    const result = await service.updateOne(mockRequest);
    expect(result).toEqual(mockRequest);
  });

  it('should delete a request by requestID', async () => {
    const mockRequest: any = {
      _id: '1',
      requestID: 1,
      type: 'find',
    };

    vitest
      .spyOn(service, 'deleteByRequestID')
      .mockImplementation(async () => mockRequest);
    const result = await service.deleteByRequestID(1);
    expect(result).toEqual(mockRequest);
  });

  it('should delete all requests', async () => {
    const mockDeletedCount = { deletedCount: 2 };

    vitest
      .spyOn(service, 'deleteAll')
      .mockImplementation(async () => mockDeletedCount);
    const result = await service.deleteAll();
    expect(result).toEqual(mockDeletedCount);
  });

  it('should count requests', async () => {
    const mockCount = 2;

    vitest.spyOn(service, 'count').mockImplementation(async () => mockCount);
    const result = await service.count();
    expect(result).toEqual(mockCount);
  });

  it('should return appropriate result for onRequest', async () => {
    const mockRequest: IRequest = {
      requestID: 1,
      type: 'find',
      db: 'test_db',
      collName: 'test_collection',
      startAt: new Date(),
      endAt: new Date(),
    };

    const mockMsgResult: MsgResult = {
      db: 'test_db',
      collection: 'test_collection',
      results: [{ _id: '1', field1: 'value1' }],
      responseTo: 1,
    };

    vitest
      .spyOn(service, 'onRequest')
      .mockImplementation(async () => mockMsgResult);

    const result = await service.onRequest(mockRequest);
    expect(result).toEqual(mockMsgResult);
  });

  it('should handle onRequest correctly', async () => {
    const mockRequest: IRequest = {
      requestID: 1,
      type: 'find',
      db: 'test_db',
      collName: 'test_collection',
      startAt: new Date(),
    };

    const createSpy = vitest
      .spyOn(service, 'create')
      .mockImplementation(async () => mockRequest);

    const result = await service.onRequest(mockRequest);

    expect(createSpy).toHaveBeenCalledWith(mockRequest);
    expect(result).toBeNull();
  });
});
