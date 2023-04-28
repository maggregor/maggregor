import { InMemoryCache } from '@core/cache';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { Request } from './request.schema';
import { MsgResponse } from '../mongodb-proxy/request-adapter';
import { MsgResult } from '../mongodb-proxy/protocol';
import { IRequest } from './request.interface';
@Injectable()
export class RequestService implements MongoDBProxyListener {
  private cache: InMemoryCache = new InMemoryCache(512);

  constructor(
    @InjectModel(Request.name)
    private readonly requestModel: Model<Request>,
  ) {}

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
  async onRequest(msg: IRequest): Promise<MsgResult> {
    const req: Request = await this.create({
      ...msg,
      startAt: new Date(),
    });
    if (this.hasCachedResults(req)) {
      req.endAt = new Date();
      req.requestSource = 'cache';
      await this.updateOne(req);
      Logger.log(`Request ${req.requestID}: Answered from cache ⚡`);
      return {
        db: msg.db,
        collection: msg.collName,
        results: this.getCachedResults(req),
        responseTo: msg.requestID,
      };
    }
    // const parsedPipeline = parsePipeline(msg.pipeline);
    // const stageCount = parsedPipeline.length;
    // Logger.log(`Request ${req.requestID}: Pipeline (${stageCount} stage(s))`);
    req.requestSource = 'delegate';
    await this.updateOne(req);
    return null;
  }

  // Event: on result from server
  async onResult(msg: MsgResponse): Promise<void> {
    const requestID = msg.responseTo;
    const req = await this.findOneByRequestId(requestID);
    if (!req) {
      return;
    }
    req.endAt = new Date();
    await this.updateOne(req);
    this.cacheResults(req, msg.data);
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

  private cacheResults(req: Request, results: any): void {
    this.withCache(req, (key, collection, db) => {
      this.cache.set(key, collection, db, results);
    });
  }
}
