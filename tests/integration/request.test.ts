import { MsgRequest } from '../../src/server/modules/mongodb-proxy/interceptors/request.interceptor';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestService } from '@server/modules/request/request.service';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Request, RequestSchema } from '@server/modules/request/request.schema';
import { Model } from 'mongoose';
import { DatabaseModule } from '@/server/modules/database/database.module';
import { InterceptedReply } from '@/server/modules/mongodb-proxy/interceptors/response.interceptor';

describe('RequestService (integration)', () => {
  let service: RequestService;
  let model: Model<Request>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        MongooseModule.forFeature([
          { name: Request.name, schema: RequestSchema },
        ]),
      ],
      providers: [RequestService],
    }).compile();

    service = module.get<RequestService>(RequestService);
    model = module.get<Model<Request>>(getModelToken(Request.name));
  });

  beforeEach(async () => {
    await model.deleteMany({});
  });

  afterAll(async () => {
    await model.deleteMany({});
  });

  const expectRequest = (result: Request, request: Request) => {
    expect(result).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - TODO: Fix this
    expect(result._id).toBeDefined();
    expect(result.request).toStrictEqual(request.request);
    expect(result.requestID).toStrictEqual(request.requestID);
    expect(result.startAt).toStrictEqual(request.startAt);
    expect(result.endAt).toStrictEqual(request.endAt);
    expect(result.collectionName).toStrictEqual(request.collectionName);
    expect(result.dbName).toStrictEqual(request.dbName);
  };

  describe('create', () => {
    it('should create a new request', async () => {
      const request = {
        request: 'test',
        requestID: 1,
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection',
        dbName: 'testDatabase',
      };
      const result = await service.create(request);
      expectRequest(result, request);
    });
  });

  describe('findAll', () => {
    it('should return all requests', async () => {
      const request1 = {
        request: 'test1',
        requestID: 1,
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection1',
        dbName: 'testDatabase1',
      };
      const request2 = {
        request: 'test2',
        requestID: 2,
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection2',
        dbName: 'testDatabase2',
      };
      await service.create(request1);
      await service.create(request2);
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
      expectRequest(result[0], request1);
      expectRequest(result[1], request2);
    });
  });

  describe('findOne', () => {
    it('should return a request by id', async () => {
      const request = {
        request: 'test',
        requestID: 1,
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection',
        dbName: 'testDatabase',
      };
      const created = await service.create(request);
      const result = await service.findOneByRequestId(created.requestID);
      expectRequest(result, request);
    });
  });

  describe('update', () => {
    it('should update a request', async () => {
      const request = {
        request: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        requestID: 3,
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection',
        dbName: 'testDatabase',
      };
      const created = await service.create(request);
      created.request = 'testUpdated';
      const updated = await service.updateOne(created);
      expectRequest(updated, {
        ...request,
        request: 'testUpdated',
      });
    });
  });

  describe('remove', () => {
    it('should remove a request', async () => {
      const request = {
        request: [
          {
            $match: {
              name: 'test',
            },
          },
        ],
        requestID: 10,
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection',
        dbName: 'testDatabase',
      };
      const created = await service.create(request);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - TODO: Fix this
      const removed = await service.deleteByRequestID(created.requestID);
      expectRequest(removed, request);
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result.length).toEqual(0);
    });
  });

  describe('onAggregateQueryFromClient', () => {
    it('should create a new request', async () => {
      const aggregateReq: MsgRequest = {
        requestID: 1,
        dbName: 'mydb',
        collectionName: 'collectionName',
        pipeline: [
          {
            $match: {
              name: 'test',
            },
          },
        ],
      };
      const aggregateResult: InterceptedReply = {
        requestID: -1,
        responseTo: 1,
        data: [
          {
            name: 'test',
          },
        ],
      };
      // Request from client to server
      let resultMsg = await service.onRequest(aggregateReq);
      const req = (await service.findAll()).at(0);
      expect(req).toBeDefined();
      expect(req.request).toStrictEqual(aggregateReq.pipeline);
      expect(req.requestID).toEqual(aggregateReq.requestID);
      expect(req.startAt).toBeDefined();
      expect(req.endAt).to.not.toBeDefined();
      expect(req.collectionName).toStrictEqual(aggregateReq.collectionName);
      expect(req.dbName).toStrictEqual(aggregateReq.dbName);
      expect(resultMsg).toBe(null);
      // Result from server to client
      await service.onResult(aggregateResult);
      const updatedReq = (await service.findAll()).at(0);
      expect(updatedReq).toBeDefined();
      expect((await service.findAll()).length).toEqual(1);
      expect(updatedReq.request).toStrictEqual(aggregateReq.pipeline);
      expect(updatedReq.requestID).toEqual(aggregateReq.requestID);
      expect(updatedReq.startAt).toBeDefined();
      // Same request from client to server
      resultMsg = await service.onRequest(aggregateReq);
      expect(resultMsg).toBeDefined();
      expect(resultMsg.results).toStrictEqual(aggregateResult.data);
      expect((await service.findAll()).length).toEqual(2);
      expect((await service.findAll()).at(1).source).toStrictEqual('cache');
    });
  });
});
