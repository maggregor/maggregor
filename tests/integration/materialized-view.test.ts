import { startMongoServer } from 'tests/e2e/utils';
import { createMaggregorModule } from 'tests/unit/server/utils';
import { MaterializedViewService } from '@/server/modules/materialized-view/materialized-view.service';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { createClient } from 'tests/e2e/contexts';
import { MongoDBTcpProxyService } from '@/server/modules/mongodb-proxy/proxy.service';
import { MongoClient } from 'mongodb';

describe('MaterializedViews (integration)', () => {
  let mvService: MaterializedViewService;
  let mongodbServer: MongoMemoryReplSet;
  let mvProxy: MongoDBTcpProxyService;
  let client: MongoClient;
  beforeAll(async () => {
    mongodbServer = await startMongoServer();
    const module = await createMaggregorModule({
      env: {
        PROXY_PORT: 4123,
        MONGODB_TARGET_URI: mongodbServer.getUri(),
      },
    });
    mvService = module.get<MaterializedViewService>(MaterializedViewService);
    mvProxy = module.get<MongoDBTcpProxyService>(MongoDBTcpProxyService);
    client = await createClient(mongodbServer.getUri());
  });

  beforeEach(async () => {
    await mvService.removeAll();
    await client.db('test').dropDatabase();
  });

  afterAll(async () => {
    mvProxy.stop();
    await mongodbServer.stop();
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
    let mvs = await mvService.getMaterializedViews();
    expect(mvs.length).toBe(0);
    await mvService.register({
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
    mvs = await mvService.getMaterializedViews();
    const mv = mvs[0];
    expect(mv).toBeDefined();
    expect(mvs.length).toBe(1);
    expect(mvService.state(mv)).toBe('LOADED');
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
    let mvs = await mvService.getMaterializedViews();
    expect(mvs.length).toBe(0);
    await mvService.register({
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
    mvs = await mvService.getMaterializedViews();
    const mv = mvs[0];
    expect(mv).toBeDefined();
    expect(mvs.length).toBe(1);
    expect(mvService.state(mv)).toBe('LOADED');
    const view = mv.getView({ useFieldHashes: false });
    expect(view.find((v) => v._id === 'test').avg).toBe(15);
    expect(view.find((v) => v._id === 'mytest').avg).toBe(20);
    mv.addDocument({ name: 'test', amount: 30 });
    const updatedView = mv.getView({ useFieldHashes: false });
    expect(updatedView.find((v) => v._id === 'test').avg).toBe(20);
    expect(updatedView.find((v) => v._id === 'mytest').avg).toBe(20);
  });
});
