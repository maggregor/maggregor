import { InMemoryCache } from '@core/cache';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { MsgAggregate } from '../mongodb-proxy/interceptors/aggregate.interceptor';
import { MsgResult as MsgResult } from '../mongodb-proxy/protocol/protocol';
import { InterceptedReply as MsgReply } from '../mongodb-proxy/interceptors/reply-interceptor';
import { parse } from '@parser/mongo-aggregation-parser';
import { Request } from './request.schema';
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
    // @ts-ignore
    await this.requestModel.updateOne({ _id: request._id }, request);
    // @ts-ignore
    return this.requestModel.findOne(request._id);
  }

  async deleteByRequestID(requestID: number): Promise<Request> {
    return this.requestModel.findOneAndDelete({ requestID });
  }

  // Event: on aggregate query from client
  async onAggregateQueryFromClient(msg: MsgAggregate): Promise<MsgResult> {
    const parsedPipeline = parsePipeline(msg.pipeline);
    const stageCount = parsedPipeline.length;
    const req: Request = await this.create({
      request: msg.pipeline,
      requestID: msg.requestID,
      collectionName: msg.collectionName,
      dbName: msg.dbName,
      startAt: new Date(),
    });
    if (this.hasCachedResults(req)) {
      req.endAt = new Date();
      req.source = 'cache';
      await this.updateOne(req);
      return this.getCachedResults(req);
    }
    Logger.log(`Request ${req.requestID}: Pipeline (${stageCount} stage(s))`);
    req.source = 'delegate';
    await this.updateOne(req);
    return null;
  }

  // Event: on result from server
  async onResultFromServer(msg: MsgReply): Promise<void> {
    const requestID = msg.responseTo;
    const req = await this.findOneByRequestId(requestID);
    req.endAt = new Date();
    await this.updateOne(req);
    this.cacheResults(req, msg.data);
    return;
  }

  private hasCachedResults(req: Request): boolean {
    return this.cache.has(req.request, req.collectionName, req.dbName);
  }

  private getCachedResults(req: Request): any {
    return this.cache.get(req.request, req.collectionName, req.dbName);
  }

  private cacheResults(req: Request, results: any): void {
    this.cache.set(req.request, req.collectionName, req.dbName, results);
  }
}

function parsePipeline(pipeline: any): any[] {
  try {
    return parse('[' + objectToString(pipeline[0]) + ']');
  } catch (e) {
    console.log('Parsing error on pipeline: ', e);
    return [];
  }
}

function objectToString(obj: object) {
  const entries = Object.entries(obj);
  const keyValuePairs = entries.map(([key, value]) => {
    const formattedValue =
      typeof value === 'object' && value !== null
        ? objectToString(value)
        : JSON.stringify(value);
    return `${key}: ${formattedValue}`;
  });
  return `{ ${keyValuePairs.join(', ')} }`;
}
