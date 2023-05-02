import { createCacheServiceWithMockDeps } from '../../utils';
import { CacheService } from '@/server/modules/cache-request/cache.service';

describe('RequestService', () => {
  let service: CacheService;

  beforeEach(async () => {
    service = await createCacheServiceWithMockDeps({
      env: {
        CACHE_MAX_SIZE: 512,
      },
    });
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should be defined when disabled', async () => {
    expect(
      await createCacheServiceWithMockDeps({
        env: {
          CACHE_MAX_SIZE: 0,
        },
      }),
    ).toBeDefined();
  });
});
