import { RequestService } from '@/server/modules/request/request.service';
import { createCacheServiceWithMockDeps } from '../../utils';

describe('RequestService', () => {
  let service: RequestService;

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
