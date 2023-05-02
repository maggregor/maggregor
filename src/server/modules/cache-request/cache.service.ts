import { InMemoryCache } from '@/core/cache';
import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import bytes from 'bytes';
import { IRequest } from '../request/request.interface';
import { IResponse } from '../mongodb-proxy/payload-resolver';
import { ListenerService } from '../mongodb-listener/listener.service';

@Injectable()
export class CacheService {
  private __cache: InMemoryCache;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ListenerService) private readonly listener: ListenerService,
  ) {
    this.logger.setContext(CacheService.name);
    this.__cache = new InMemoryCache(this.config.get('CACHE_MAX_SIZE') ?? 512);
    const maxSize = this.__cache.maxSize;
    if (maxSize <= 0) {
      this.logger.warn('In-memory cache disabled');
      return;
    }
    const fmtSize = bytes(maxSize);
    this.logger.success(`In-memory cache initialize with max size: ${fmtSize}`);
  }

  private withCache<T>(
    req: IRequest,
    operation: (key: string, collection: string, db: string, data?: T) => T,
  ): T {
    const key = JSON.stringify(req.pipeline || req.filter || req.query || {});
    return operation(key, req.collName, req.db);
  }

  public hasCachedResults(req: IRequest): boolean {
    return this.withCache(req, (key, collection, db) =>
      this.__cache.has(key, collection, db),
    );
  }

  public getCachedResults(req: IRequest): any {
    return this.withCache(req, (key, collection, db) =>
      this.__cache.get(key, collection, db),
    );
  }

  public tryCacheResults(req: IRequest, res: IResponse): void {
    if (!this.canCache(req, res)) {
      return;
    }
    this.withCache(req, (key, collection, db) => {
      this.__cache.set(key, collection, db, res.data);
      this.listener.subscribeToCollectionChanges(db, collection, () => {
        this.logger.debug(
          `CacheService: Received change on collection ${collection} in database ${db}`,
        );
        this.__cache.invalidateCollection(db, collection);
      });
    });
  }

  /**
   * Checks if the request can be cached.
   * TODO: Check if the request doesn't contains
   * - time-based operators.
   * - user-based operators.
   * @param req
   * @param res
   * @returns
   */
  public canCache(req: IRequest, res: IResponse): boolean {
    if (res.data === undefined) {
      /**
       * We don't cache undefined results.
       * This is the case when the response type isn't supported by Maggregor.
       */
      return false;
    }
    /**
     * We apply a control on the request type to avoid caching irrelevant requests.
     */
    return ['find', 'aggregate'].includes(req.type);
  }
}
