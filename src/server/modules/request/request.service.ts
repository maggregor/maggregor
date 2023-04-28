import { InMemoryCache } from '@core/cache';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { Request } from './request.schema';
import { IResponse } from '../mongodb-proxy/payload-resolver';
import { MsgResult } from '../mongodb-proxy/protocol';
import { IRequest, RequestType } from './request.interface';
import { LoggerService } from '../logger/logger.service';
@Injectable()
export class RequestService implements MongoDBProxyListener {
  private cache: InMemoryCache = new InMemoryCache(512);

  constructor(
    @InjectModel(Request.name) private readonly requestModel: Model<Request>,
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {
    this.logger.setContext('Requests');
  }

  async create(request: Request): Promise<Request> {
    return this.requestModel.create(request);
  }

  async findAll(): Promise<Request[]> {
    return this.requestModel.find();
  }

  async findOneByRequestId(requestID: number): Promise<Request> {
    return this.requestModel.findOne({ requestID });
  }

  async updateOne(request: Request): Promise<Request> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - TODO: fix this
    await this.requestModel.updateOne({ _id: request._id }, request);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - TODO: fix this
    return this.requestModel.findOne(request._id);
  }

  async deleteByRequestID(requestID: number): Promise<Request> {
    return this.requestModel.findOneAndDelete({ requestID });
  }

  // Event: on aggregate query from client
  async onRequest(newReq: IRequest): Promise<MsgResult> {
    newReq.startAt = new Date();
    const req: Request = await this.create(newReq);
    console.log(req.pipeline);
    if (this.hasCachedResults(req)) {
      req.endAt = new Date();
      req.requestSource = 'cache';
      await this.updateOne(req);
      this.logger.log(
        `id:${req.requestID}: (${req.type}) Answered from cache (${
          req.endAt.getTime() - req.startAt.getTime()
        }ms)`,
      );
      return {
        db: newReq.db,
        collection: newReq.collName,
        results: this.getCachedResults(req),
        responseTo: newReq.requestID,
      };
    }
    req.requestSource = 'delegate';
    await this.updateOne(req);
    return null;
  }

  // Event: on result from server
  async onResult(res: IResponse): Promise<void> {
    const requestID = res.responseTo;
    const req = await this.findOneByRequestId(requestID);
    if (!req) {
      return;
    }
    console.log(req.pipeline);
    req.endAt = new Date();
    this.updateOne(req);
    this.tryCacheResults(req, res);
    this.logger.log(
      `id:${req.requestID}: (${req.type}) Answered from MongoDB (${
        req.endAt.getTime() - req.startAt.getTime()
      }ms)`,
    );
    return;
  }

  private withCache<T>(
    req: Request,
    operation: (key: string, collection: string, db: string, data?: T) => T,
  ): T {
    const key = JSON.stringify(req.pipeline || req.filter || req.query || {});
    return operation(key, req.collName, req.db);
  }

  private hasCachedResults(req: Request): boolean {
    return this.withCache(req, (key, collection, db) =>
      this.cache.has(key, collection, db),
    );
  }

  private getCachedResults(req: Request): any {
    return this.withCache(req, (key, collection, db) =>
      this.cache.get(key, collection, db),
    );
  }

  private tryCacheResults(req: IRequest, res: IResponse): void {
    if (!canCache(req, res)) {
      // Not eligible for caching.
      return;
    }
    this.withCache(req, (key, collection, db) => {
      this.cache.set(key, collection, db, res.data);
    });
  }
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
function canCache(req: IRequest, res: IResponse): boolean {
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
