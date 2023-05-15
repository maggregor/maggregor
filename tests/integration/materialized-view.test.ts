import { startMongoServer, wait } from 'tests/e2e/utils';
import { createMaggregorModule } from 'tests/unit/server/utils';
import { MaterializedViewService } from '@/server/modules/materialized-view/materialized-view.service';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { createClient } from 'tests/e2e/contexts';
import { MongoDBTcpProxyService } from '@/server/modules/mongodb-proxy/proxy.service';

describe('MaterializedViews (integration)', () => {
  let mvService: MaterializedViewService;
  let mongodbServer: MongoMemoryReplSet;
  let mvProxy: MongoDBTcpProxyService;
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
  });

  afterAll(async () => {
    mvProxy.stop();
    await mongodbServer.stop();
  });

  it('should create a new materialized view', async () => {
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
      ]);
    let mvs = await mvService.getMaterializedViews();
    expect(mvs.length).toBe(0);
    mvService.register({
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
    mvs = await mvService.getMaterializedViews();
    const mv = mvs[0];
    expect(mv).toBeDefined();
    expect(mvs.length).toBe(1);
    expect(mvService.state(mv)).toBe('LOADED');
  });
  it('test', () => {
    expect(1).toBe(1);
  });
});
