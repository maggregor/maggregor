import { CacheService } from '@/server/modules/cache-request/cache.service';
import { IResponse } from '@/server/modules/mongodb-proxy/payload-resolver';
import { IRequest } from '@/server/modules/request/request.interface';
import {
  createCacheServiceWithMockDeps,
  createMockRequest,
  createMockResponse,
} from '../../utils';

const cacheMaxSizeMb = 512;

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    service = await createCacheServiceWithMockDeps({
      env: {
        CACHE_MAX_SIZE: cacheMaxSizeMb,
      },
    });
  });

  describe('when the in-memory cache is disabled', () => {
    it('should not cache results', async () => {
      expect(service.hasCachedResults({} as IRequest)).toBeFalsy();
      expect(service.getCachedResults({} as IRequest)).toBeNull();
      service.tryCacheResults({} as IRequest, {} as IResponse);
      expect(service.hasCachedResults({} as IRequest)).toBeFalsy();
      expect(service.getCachedResults({} as IRequest)).toBeNull();
    });
  });

  describe('when the in-memory cache is enabled', () => {
    it('should initialize the cache with the max size specified in the configuration file', async () => {
      expect(service['__cache'].maxSize).toEqual(cacheMaxSizeMb * 1024 * 1024);
    });

    describe('hasCachedResults', () => {
      it('should return true if the result is cached', async () => {
        const req = createMockRequest();
        const res = createMockResponse();
        service.tryCacheResults(req, res);
        expect(service.hasCachedResults(req)).toBeTruthy();
      });

      it('should return false if the result is not cached', async () => {
        const req = createMockRequest();
        expect(service.hasCachedResults(req)).toBeFalsy();
      });
    });

    describe('getCachedResults', () => {
      it('should return the cached result for a request', () => {
        const req = createMockRequest();
        const res = createMockResponse({
          data: [{ name: 'John', city: 'Los Angeles' }],
        });
        service.tryCacheResults(req, res);
        const cachedResult = service.getCachedResults(req);
        expect(cachedResult).toEqual(res.data);
      });

      it('should return null if the result is not cached', () => {
        const req = createMockRequest();
        const cachedResult = service.getCachedResults(req);
        expect(cachedResult).toBeNull();
      });
    });

    describe('tryCacheResults', () => {
      it('should cache results if the request is eligible for caching', () => {
        const req: IRequest = createMockRequest({
          type: 'aggregate',
          pipeline: [{ $match: { city: 'New York' } }],
        });
        const res: IResponse = createMockResponse({
          data: [{ name: 'John', city: 'New York' }],
        });
        service.tryCacheResults(req, res);
        const cachedResult = service.getCachedResults(req);
        expect(cachedResult).toEqual(res.data);
      });

      it('should not cache results if the request is not eligible for caching', () => {
        const req: IRequest = createMockRequest({
          type: 'distinct',
          key: 'city',
          db: 'testDb',
          collName: 'testColl',
        });
        const res = createMockResponse({ data: { name: 'John' } });
        service.tryCacheResults(req, res);
        const cachedResult = service.getCachedResults(req);
        expect(cachedResult).toBeNull();
      });
    });

    describe('hasCachedResults', () => {
      it('should return true if the results for a request are cached', () => {
        const req = createMockRequest({
          type: 'find',
          db: 'testDb',
          collName: 'testColl',
          pipeline: [{ $match: { city: 'Los Angeles' } }],
        });
        const res = createMockResponse({
          data: [{ name: 'John', city: 'Los Angeles' }],
        });
        service.tryCacheResults(req, res);
        const hasCachedResults = service.hasCachedResults(req);
        expect(hasCachedResults).toBe(true);
      });

      it('should return false if the results for a request are not cached', () => {
        const req = createMockRequest({
          type: 'find',
          db: 'testDb',
          collName: 'testColl',
          pipeline: [{ $match: { city: 'Los Angeles' } }],
        });
        const hasCachedResults = service.hasCachedResults(req);
        expect(hasCachedResults).toBe(false);
      });
    });

    describe('canCache', () => {
      it('should return true for a find request with a match operator', () => {
        const req = createMockRequest({
          type: 'find',
          db: 'testDb',
          collName: 'testColl',
          pipeline: [{ $match: { city: 'Los Angeles' } }],
        });
        const res = createMockResponse({
          data: [{ name: 'John', city: 'Los Angeles' }],
        });
        const canCache = service.canCache(req, res);
        expect(canCache).toBe(true);
      });
    });
  });
});
