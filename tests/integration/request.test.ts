import { RequestService } from '@server/modules/request/request.service';
import { Request } from '@server/modules/request/request.schema';
import { IRequest } from '@/server/modules/request/request.interface';
import { IResponse } from '@/server/modules/mongodb-proxy/payload-resolver';
import { simulateDelay, startRedisServer, wait } from 'tests/e2e/utils';
import { createMaggregorModule } from 'tests/unit/server/utils';
import { MaterializedViewService } from '@/server/modules/materialized-view/materialized-view.service';
import { mockedSession } from 'tests/unit/server/mocks';
import RedisMemoryServer from 'redis-memory-server';
import { ListenerService } from '@/server/modules/mongodb-listener/listener.service';

describe('RequestService (integration)', () => {
  let requestService: RequestService;
  let mvService: MaterializedViewService;
  let listenerService: ListenerService;
  let redis: RedisMemoryServer;

  beforeAll(async () => {
    redis = await startRedisServer();
    const module = await createMaggregorModule({
      env: {
        REDIS_HOST: await redis.getHost(),
        REDIS_PORT: await redis.getPort(),
      },
    });
    requestService = module.get<RequestService>(RequestService);
    mvService = module.get<MaterializedViewService>(MaterializedViewService);
    listenerService = module.get<ListenerService>(ListenerService);
    // Mock listener service methods
    listenerService.executeAggregatePipeline = vitest.fn().mockReturnValue([]);
    listenerService.subscribeToCollectionChanges = vitest.fn();
    listenerService.unsubscribeFromCollectionChanges = vitest.fn();
  });

  beforeEach(async () => {
    await requestService?.deleteAll();
  });

  afterAll(async () => {
    await requestService?.deleteAll();
    await redis.stop();
  });

  const expectRequest = (actual: Request, request: Request) => {
    expect(actual).toBeDefined();
    expect(actual.id).toStrictEqual(request.id);
    expect(actual.pipeline).toStrictEqual(request.pipeline);
    expect(actual.type).toStrictEqual(request.type);
    expect(actual.filter).toStrictEqual(request.filter);
    expect(actual.query).toStrictEqual(request.query);
    expect(actual.mongoRequestID).toStrictEqual(request.mongoRequestID);
    expect(actual.collName).toStrictEqual(request.collName);
    expect(actual.db).toStrictEqual(request.db);
  };

  describe('create', () => {
    it('should create a new request', async () => {
      const request: Request = {
        id: '1',
        filter: { test: 'test' },
        type: 'find',
        mongoRequestID: 1,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection',
        db: 'testDatabase',
      };
      const result = await requestService.create(request);
      expectRequest(result, request);
    });
  });

  describe('findAll', () => {
    it('should return all requests', async () => {
      const request1: IRequest = {
        id: '1',
        filter: { test: 'test' },
        type: 'find',
        mongoRequestID: 1,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection1',
        db: 'testDatabase1',
      };
      const request2: IRequest = {
        id: '1',
        filter: { test: 'test' },
        type: 'aggregate',
        mongoRequestID: 2,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection2',
        db: 'testDatabase2',
      };
      await requestService.create(request1);
      await requestService.create(request2);
      const result = await requestService.findAll();
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
      expectRequest(result[0], request1);
      expectRequest(result[1], request2);
    });
  });

  describe('findOne', () => {
    it('should return a request by id', async () => {
      const request: IRequest = {
        id: '1',
        type: 'find',
        filter: { test: 'test' },
        mongoRequestID: 1,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection',
        db: 'testDatabase',
      };
      const created = await requestService.create(request);
      const result = await requestService.findOne(created.id);
      expectRequest(result, request);
    });
  });

  describe('update', () => {
    it('should update a request', async () => {
      const request: Request = {
        id: '1',
        type: 'aggregate',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        mongoRequestID: 3,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection',
        db: 'testDatabase',
      };
      const created = await requestService.create(request);
      created.pipeline = [
        { $project: { name: 1 } },
        { $match: { name: 'testUpdated' } },
      ];
      const updated = await requestService.updateOne(created);
      expectRequest(updated, {
        ...request,
        pipeline: created.pipeline,
      });
    });
  });

  describe('remove', () => {
    it('should remove a request', async () => {
      const request: Request = {
        id: '1',
        type: 'aggregate',
        pipeline: [
          {
            $match: {
              name: 'test',
            },
          },
        ],
        mongoRequestID: 10,
        startAt: new Date(),
        endAt: new Date(),
        collName: 'testCollection',
        db: 'testDatabase',
      };
      const created = await requestService.create(request);
      const removed = await requestService.deleteById(created.id);
      expectRequest(removed, request);
      const result = await requestService.findAll();
      expect(result).toBeDefined();
      expect(result.length).toEqual(0);
    });
  });

  describe('onRequest', () => {
    it('should create a new request', async () => {
      const aggregateReq: IRequest = {
        id: '1',
        type: 'aggregate',
        mongoRequestID: 1,
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
      const aggregateResult: IResponse = {
        mongoRequestID: -1,
        responseTo: 1,
        data: [
          {
            name: 'test',
          },
        ],
      };
      // Request from client to server
      let resultMsg = await requestService.onRequest(
        aggregateReq,
        mockedSession,
      );
      await simulateDelay();
      const req = (await requestService.findAll()).at(0);
      expectRequest(req, aggregateReq);
      expect(resultMsg).toBe(null);
      // Result from server to client
      await requestService.onResponse(aggregateResult, mockedSession);
      await simulateDelay();
      const updatedReq = (await requestService.findAll()).at(0);
      expect(updatedReq).toBeDefined();
      expect((await requestService.findAll()).length).toEqual(1);
      // expect(updatedReq.request).toStrictEqual(aggregateReq.pipeline);
      expect(updatedReq.mongoRequestID).toEqual(aggregateReq.mongoRequestID);
      expect(updatedReq.startAt).toBeDefined();
      // Same request from client to server
      resultMsg = await requestService.onRequest(aggregateReq, mockedSession);
      await wait(50);
      expect(resultMsg).toBeDefined();
      expect(resultMsg.results).toStrictEqual(aggregateResult.data);
      const requests = await requestService.findAll();
      expect(requests.length).toEqual(2);
      expect(requests.at(1).requestSource).toEqual('maggregor_cache');
    });
    it('should be processed with a Materialized View', async () => {
      const aggregateReq: IRequest = {
        id: '1',
        type: 'aggregate',
        mongoRequestID: 1,
        db: 'mydb',
        collName: 'collection',
        pipeline: [
          {
            $group: {
              _id: '$country',
            },
          },
        ],
      };
      await mvService.createMaterializedView({
        db: 'mydb',
        collection: 'collection',
        groupBy: { field: 'country' },
        accumulatorDefs: [],
      });
      const resultMsg = await requestService.onRequest(
        aggregateReq,
        mockedSession,
      );
      await wait(5); // Wait for the request to be stored in the DB
      expect(mvService.getMaterializedViews().length).toEqual(1);
      const req = (await requestService.findAll()).at(0);
      expect(req).toBeDefined();
      expect(req.requestSource).toStrictEqual('maggregor_mv');
      expect(resultMsg).not.toBe(null);
    });
    it('should cache a find request', async () => {
      const findReq: IRequest = {
        id: '1',
        type: 'find',
        mongoRequestID: 1,
        db: 'mydb',
        collName: 'collection',
        filter: {
          name: 'test',
        },
      };
      const findResult: IResponse = {
        mongoRequestID: -1,
        responseTo: 1,
        data: [
          {
            name: 'test',
          },
        ],
      };
      // Request from client to server
      let resultMsg = await requestService.onRequest(findReq, mockedSession);
      await simulateDelay();
      const req = (await requestService.findAll()).at(0);
      expectRequest(req, findReq);
      expect(resultMsg).toBe(null);
      // Result from server to client
      await requestService.onResponse(findResult, mockedSession);
      await simulateDelay();
      const updatedReq = (await requestService.findAll()).at(0);
      expect(updatedReq).toBeDefined();
      expect((await requestService.findAll()).length).toEqual(1);
      expect(updatedReq.mongoRequestID).toEqual(findReq.mongoRequestID);
      expect(updatedReq.startAt).toBeDefined();
      // Same request from client to server
      resultMsg = await requestService.onRequest(findReq, mockedSession);
      await simulateDelay();
      expect(resultMsg).toBeDefined();
      expect(resultMsg.results).toStrictEqual(findResult.data);
      const requests = await requestService.findAll();
      expect(requests.length).toEqual(2);
      expect(requests.at(1).requestSource).toEqual('maggregor_cache');
    });
  });
});
