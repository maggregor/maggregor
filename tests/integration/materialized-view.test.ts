import { startMongoServer, startRedisServer, wait } from 'tests/e2e/utils';
import { createMaggregorModule } from 'tests/unit/server/utils';
import { MaterializedViewService } from '@/server/modules/materialized-view/materialized-view.service';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { createClient } from 'tests/e2e/contexts';
import { MongoDBTcpProxyService } from '@/server/modules/mongodb-proxy/proxy.service';
import { MongoClient } from 'mongodb';
import RedisMemoryServer from 'redis-memory-server';

describe('MaterializedViews (integration)', () => {
  let mvService: MaterializedViewService;
  let mongodbServer: MongoMemoryReplSet;
  let mvProxy: MongoDBTcpProxyService;
  let client: MongoClient;
  let redis: RedisMemoryServer;
  beforeAll(async () => {
    mongodbServer = await startMongoServer();
    redis = await startRedisServer();
    const module = await createMaggregorModule({
      env: {
        PROXY_PORT: 4123,
        MONGODB_TARGET_URI: mongodbServer.getUri(),
        REDIS_HOST: await redis.getHost(),
        REDIS_PORT: await redis.getPort(),
      },
    });
    mvService = module.get<MaterializedViewService>(MaterializedViewService);
    mvProxy = module.get<MongoDBTcpProxyService>(MongoDBTcpProxyService);
    client = await createClient(mongodbServer.getUri());
  });

  beforeEach(async () => {
    await mvService?.removeAll();
    await client.db('test').dropDatabase();
  });

  afterAll(async () => {
    mvProxy.stop();
    await mongodbServer.stop();
    await redis.stop();
  });

  it('should create a new materialized view', async () => {
    await client
      .db('test')
      .collection('test')
      .insertMany([
        {
          name: 'test',
          amount: 10,
        },
        {
          name: 'test',
          amount: 20,
        },
      ]);
    let mvs = mvService.getMaterializedViews();
    expect(mvs.length).toBe(0);
    const job = await mvService.addToCreationQueue({
      db: 'test',
      collection: 'test',
      groupBy: {
        field: 'name',
      },
      accumulatorDefs: [
        {
          operator: 'sum',
          outputFieldName: 'total',
          expression: {
            field: 'amount',
          },
        },
      ],
    });
    await wait(1000);
    expect(await job.getState()).toBe('waiting');
    mvs = mvService.getMaterializedViews();
    const mv = mvs[0];
    expect(mv).toBeDefined();
    expect(mvs.length).toBe(1);
    expect(mv.getView({ useFieldHashes: false })).toEqual([
      {
        _id: 'test',
        total: 30,
      },
    ]);
    mv.addDocument({ name: 'test', amount: 30 });
    expect(mv.getView({ useFieldHashes: false })).toEqual([
      {
        _id: 'test',
        total: 60,
      },
    ]);
  });
  it('should create a new materialized view an avg accumulator', async () => {
    const client = await createClient(mongodbServer.getUri());
    await client
      .db('test')
      .collection('test')
      .insertMany([
        {
          name: 'test',
          amount: 10,
        },
        {
          name: 'test',
          amount: 20,
        },
        {
          name: 'mytest',
          amount: 20,
        },
      ]);
    let mvs = mvService.getMaterializedViews();
    expect(mvs.length).toBe(0);
    const job = await mvService.addToCreationQueue({
      db: 'test',
      collection: 'test',
      groupBy: {
        field: 'name',
      },
      accumulatorDefs: [
        {
          operator: 'avg',
          outputFieldName: 'avg',
          expression: {
            field: 'amount',
          },
        },
      ],
    });
    expect(await job.getState()).toBe('waiting');
    await wait(1000);
    mvs = mvService.getMaterializedViews();
    const mv = mvs[0];
    expect(mv).toBeDefined();
    expect(mvs.length).toBe(1);
    const view = mv.getView({ useFieldHashes: false });
    expect(view.find((v) => v._id === 'test').avg).toBe(15);
    expect(view.find((v) => v._id === 'mytest').avg).toBe(20);
    mv.addDocument({ name: 'test', amount: 30 });
    const updatedView = mv.getView({ useFieldHashes: false });
    expect(updatedView.find((v) => v._id === 'test').avg).toBe(20);
    expect(updatedView.find((v) => v._id === 'mytest').avg).toBe(20);
  });
});
