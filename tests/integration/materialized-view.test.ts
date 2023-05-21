import { startMongoServer, startRedisServer, wait } from 'tests/e2e/utils';
import { createMaggregorModule } from 'tests/unit/server/utils';
import { MaterializedViewService } from '@/server/modules/materialized-view/materialized-view.service';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { createClient } from 'tests/e2e/contexts';
import { MongoDBTcpProxyService } from '@/server/modules/mongodb-proxy/proxy.service';
import { MongoClient } from 'mongodb';
import RedisMemoryServer from 'redis-memory-server';
import { MaterializedViewDefinition } from '@/core/materialized-view';

const MV_DEF_SUM: MaterializedViewDefinition = {
  db: 'test',
  collection: 'test',
  groupBy: {
    field: 'name',
  },
  accumulatorDefs: [
    {
      operator: 'sum',
      outputFieldName: 'amountTotal',
      expression: {
        field: 'amount',
      },
    },
  ],
};

const MV_DEF_AVG: MaterializedViewDefinition = {
  db: 'test',
  collection: 'test',
  groupBy: {
    field: 'name',
  },
  accumulatorDefs: [
    {
      operator: 'avg',
      outputFieldName: 'amountAvg',
      expression: {
        field: 'amount',
      },
    },
  ],
};

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
    await module.init();
    mvService = module.get<MaterializedViewService>(MaterializedViewService);
    mvProxy = module.get<MongoDBTcpProxyService>(MongoDBTcpProxyService);
    client = await createClient(mongodbServer.getUri());
  });

  beforeEach(async () => {
    await mvService?.removeAll();
    await client.db('test').dropDatabase();
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
  });

  afterAll(async () => {
    mvProxy.stop();
    await mongodbServer.stop();
    await redis.stop();
  });

  it('should create a new materialized view', async () => {
    let mvs = mvService.getMaterializedViews();
    expect(mvs.length).toBe(0);
    await mvService.createMaterializedView(MV_DEF_SUM);
    mvs = mvService.getMaterializedViews();
    const mv = mvs[0];
    expect(mv).toBeDefined();
    expect(mvs.length).toBe(1);
    // Materialized view should be correctly initialized
    const view = mv.getView({ useFieldHashes: false });
    expect(view.find((v) => v._id === 'test').amountTotal).toBe(30);
    expect(view.find((v) => v._id === 'mytest').amountTotal).toBe(20);
    mv.addDocument({ name: 'test', amount: 30 });
    // Materialized view should be correctly recalculated
    const updatedView = mv.getView({ useFieldHashes: false });
    expect(updatedView.find((v) => v._id === 'test').amountTotal).toBe(60);
    expect(updatedView.find((v) => v._id === 'mytest').amountTotal).toBe(20);
  });
  it('should create a new materialized view an avg accumulator', async () => {
    let mvs = mvService.getMaterializedViews();
    expect(mvs.length).toBe(0);
    await mvService.createMaterializedView(MV_DEF_AVG);
    mvs = mvService.getMaterializedViews();
    const mv = mvs[0];
    expect(mv).toBeDefined();
    expect(mvs.length).toBe(1);
    // Materialized view should be correctly initialized
    const view = mv.getView({ useFieldHashes: false });
    expect(view.find((v) => v._id === 'test').amountAvg).toBe(15);
    expect(view.find((v) => v._id === 'mytest').amountAvg).toBe(20);
    mv.addDocument({ name: 'test', amount: 30 });
    // Materialized view should be correctly recalculated
    const updatedView = mv.getView({ useFieldHashes: false });
    expect(updatedView.find((v) => v._id === 'test').amountAvg).toBe(20);
    expect(updatedView.find((v) => v._id === 'mytest').amountAvg).toBe(20);
  });

  describe('when a mv is added to the creation queue', () => {
    it('should create a new materialized view', async () => {
      const job = await mvService.addToCreationQueue(MV_DEF_SUM);
      expect(job).toBeDefined();
      expect(job.getState()).resolves.not.toBe('completed');
      await wait(250); // Wait for the job to be processed
      const mvs = mvService.getMaterializedViews();
      expect(mvs.length).toBe(1);
      expect(job.getState()).resolves.toBe('completed');
    });
  });
});
