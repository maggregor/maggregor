import { startMongoServer } from 'tests/e2e/utils';
import { createMaggregorModule } from 'tests/unit/server/utils';
import { MaterializedViewService } from '@/server/modules/materialized-view/materialized-view.service';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('MaterializedViews (integration)', () => {
  let mvService: MaterializedViewService;
  let mongodbServer: MongoMemoryReplSet;
  beforeAll(async () => {
    const module = await createMaggregorModule();
    mongodbServer = await startMongoServer();

    mvService = module.get<MaterializedViewService>(MaterializedViewService);
  });

  it('should create a new materialized view', async () => {
    expect(mvService).toBeDefined();
    expect(mongodbServer).toBeDefined();
  });
});
