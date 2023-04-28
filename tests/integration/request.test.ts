import { Test, TestingModule } from '@nestjs/testing';
import { RequestService } from '@server/modules/request/request.service';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Request, RequestSchema } from '@server/modules/request/request.schema';
import { Model } from 'mongoose';
import { DatabaseModule } from '@/server/modules/database/database.module';
import { IRequest } from '@/server/modules/request/request.interface';
import { MsgResponse } from '@/server/modules/mongodb-proxy/request-adapter';

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
    expect(result.pipeline).toStrictEqual(request.pipeline);
    expect(result.type).toStrictEqual(request.type);
    expect(result.filter).toStrictEqual(request.filter);
    expect(result.query).toStrictEqual(request.query);
    expect(result.requestID).toStrictEqual(request.requestID);
    expect(result.startAt).toStrictEqual(request.startAt);
    expect(result.endAt).toStrictEqual(request.endAt);
    expect(result.collName).toStrictEqual(request.collName);
    expect(result.db).toStrictEqual(request.db);
  };

  describe('create', () => {
    it('should create a new request', async () => {
      const request: Request = {
        filter: { test: 'test' },
        type: 'find',
        requestID: 1,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection',
        db: 'testDatabase',
      };
      const result = await service.create(request);
      expectRequest(result, request);
    });
  });

  describe('findAll', () => {
    it('should return all requests', async () => {
      const request1: IRequest = {
        filter: { test: 'test' },
        type: 'find',
        requestID: 1,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection1',
        db: 'testDatabase1',
      };
      const request2: IRequest = {
        filter: { test: 'test' },
        type: 'aggregate',
        requestID: 2,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection2',
        db: 'testDatabase2',
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
      const request: IRequest = {
        type: 'find',
        filter: { test: 'test' },
        requestID: 1,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection',
        db: 'testDatabase',
      };
      const created = await service.create(request);
      const result = await service.findOneByRequestId(created.requestID);
      expectRequest(result, request);
    });
  });

  describe('update', () => {
    it('should update a request', async () => {
      const request: Request = {
        type: 'aggregate',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        requestID: 3,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection',
        db: 'testDatabase',
      };
      const created = await service.create(request);
      created.pipeline = [
        { $project: { name: 1 } },
        { $match: { name: 'testUpdated' } },
      ];
      const updated = await service.updateOne(created);
      expectRequest(updated, {
        ...request,
        pipeline: created.pipeline,
      });
    });
  });

  describe('remove', () => {
    it('should remove a request', async () => {
      const request: Request = {
        type: 'aggregate',
        pipeline: [
          {
            $match: {
              name: 'test',
            },
          },
        ],
        requestID: 10,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection',
        db: 'testDatabase',
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
      const aggregateReq: IRequest = {
        type: 'aggregate',
        requestID: 1,
        db: 'mydb',
        collName: 'collection',
        pipeline: [
          {
            $match: {
              name: 'test',
            },
          },
        ],
      };
      const aggregateResult: MsgResponse = {
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
      // expect(req.request).toStrictEqual(aggregateReq.pipeline);
      expect(req.requestID).toEqual(aggregateReq.requestID);
      expect(req.startAt).toBeDefined();
      expect(req.endAt).to.not.toBeDefined();
      expect(req.collName).toStrictEqual(aggregateReq.collName);
      expect(req.db).toStrictEqual(aggregateReq.db);
      expect(resultMsg).toBe(null);
      // Result from server to client
      await service.onResult(aggregateResult);
      const updatedReq = (await service.findAll()).at(0);
      expect(updatedReq).toBeDefined();
      expect((await service.findAll()).length).toEqual(1);
      // expect(updatedReq.request).toStrictEqual(aggregateReq.pipeline);
      expect(updatedReq.requestID).toEqual(aggregateReq.requestID);
      expect(updatedReq.startAt).toBeDefined();
      // Same request from client to server
      resultMsg = await service.onRequest(aggregateReq);
      expect(resultMsg).toBeDefined();
      expect(resultMsg.results).toStrictEqual(aggregateResult.data);
      expect((await service.findAll()).length).toEqual(2);
      expect((await service.findAll()).at(1).requestSource).toStrictEqual(
        'cache',
      );
    });
  });
});
