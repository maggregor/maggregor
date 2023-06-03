import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBProxyListener, Session } from '../mongodb-proxy/proxy.service';
import { Request } from './request.schema';
import { IResponse } from '../mongodb-proxy/payload-resolver';
import { MsgResult } from '../mongodb-proxy/protocol';
import { IRequest } from './request.interface';
import { LoggerService } from '../logger/logger.service';
import { CacheService } from '../cache-request/cache.service';
import { MaterializedViewService } from '../materialized-view/materialized-view.service';
@Injectable()
export class RequestService implements MongoDBProxyListener {
  constructor(
    @InjectModel(Request.name) private readonly requestModel: Model<Request>,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(CacheService) private readonly cacheService: CacheService,
    @Inject(MaterializedViewService)
    private readonly mvService: MaterializedViewService,
  ) {
    this.logger.setContext('Requests');
  }

  async create(request: Request): Promise<Request> {
    return this.requestModel.create(request);
  }

  async findAll(): Promise<Request[]> {
    return this.requestModel.find();
  }

  async findOne(id: string): Promise<Request> {
    return this.requestModel.findOne({ id });
  }

  async updateOne(req: IRequest): Promise<Request> {
    await this.requestModel.updateOne({ id: req.id }, req);
    return this.requestModel.findOne({ id: req.id });
  }

  async deleteById(id: string): Promise<Request> {
    return this.requestModel.findOneAndDelete({ id });
  }

  async deleteAll(): Promise<{ deletedCount: number }> {
    const result = await this.requestModel.deleteMany({});
    return { deletedCount: result.deletedCount };
  }

  async count(): Promise<number> {
    return this.requestModel.count();
  }

  /**
   * Called when a request is received from the client.
   * This method is called before the request is forwarded to MongoDB.
   * It allows to intercept the request and to answer it directly from Maggregor.
   *
   * @param session
   * @param req
   * @returns
   */
  async onRequest(req: IRequest, session: Session): Promise<MsgResult> {
    // Define a unique id for the request
    req.id = this.resolveUniqueRequestId(session, req.mongoRequestID);
    let results = null;
    req.startAt = new Date();

    // We ignore admin requests (such as heartbeat, listDatabases, etc.)
    if (req.db === 'admin') return null;

    // Attempt to answer via cache
    if (this.cacheService.hasCachedResults(req)) {
      results = this.cacheService.getCachedResults(req);
      req.requestSource = 'maggregor_cache';
    }
    // Attempt to answer via Materialized Views
    else if (await this.mvService.canExecute(req)) {
      results = await this.mvService.execute(req);
      req.requestSource = 'maggregor_mv';
    }
    // Finally, deleguate the request to MongoDB
    else {
      /**
       * Maggregor is not able to answer the request from cache or from the
       * Materialized Views, so we need to forward the request to MongoDB.
       */
      req.requestSource = 'mongodb';
    }
    // Save the request to the database
    this.create(req);

    if (req.requestSource === 'mongodb') {
      // Forward the request to MongoDB
      return null;
    }

    // Maggregor is able to answer by itself
    this.markAsCompleted(req);
    return {
      db: req.db,
      collection: req.collName,
      results,
      responseTo: req.mongoRequestID,
    } as MsgResult;
  }

  // Event: on result from server
  async onResponse(res: IResponse, session: Session): Promise<void> {
    const id = this.resolveUniqueRequestId(session, res.responseTo);
    const req = await this.findOne(id);
    if (!req) return;
    this.markAsCompleted(req);
    this.updateOne(req);
    this.cacheService.tryCacheResults(req, res);
  }

  markAsCompleted(req: IRequest) {
    if (req.type === 'unknown') {
      // We ignore unknown requests (such as heartbeat, listDatabases, etc.)
      return;
    }
    const id = req.mongoRequestID;
    const src = req.requestSource;
    req.endAt = new Date();
    this.logger.log(`${id}: (${req.type}) Answered from ${src} (${ms(req)})`);
  }

  resolveUniqueRequestId(session: Session, mongoRequestId: number) {
    return `${session.id}-${mongoRequestId}`;
  }
}

function ms(req: IRequest) {
  return `${req.endAt.getTime() - req.startAt.getTime()}ms`;
}
