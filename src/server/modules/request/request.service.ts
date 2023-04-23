import { InMemoryCache } from '@core/cache';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { parse } from '@parser/mongo-aggregation-parser';
import { Request } from './request.schema';
import { MsgRequest, MsgResponse } from '../mongodb-proxy/messages';
import { MsgResult } from '../mongodb-proxy/protocol';
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
  async onRequest(msg: MsgRequest): Promise<MsgResult> {
    const req: Request = await this.create({
      request: JSON.stringify(msg),
      requestID: msg.requestID,
      collectionName: msg.collectionName,
      dbName: msg.dbName,
      startAt: new Date(),
    });
    if (this.hasCachedResults(req)) {
      req.endAt = new Date();
      req.source = 'cache';
      await this.updateOne(req);
      Logger.log(`Request ${req.requestID}: Answered from cache ⚡`);
      return {
        db: msg.dbName,
        collection: msg.collectionName,
        results: this.getCachedResults(req),
        responseTo: msg.requestID,
      };
    }
    // const parsedPipeline = parsePipeline(msg.pipeline);
    // const stageCount = parsedPipeline.length;
    // Logger.log(`Request ${req.requestID}: Pipeline (${stageCount} stage(s))`);
    req.source = 'delegate';
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

  private hasCachedResults(req: Request): boolean {
    return this.cache.has(
      JSON.stringify(req.request),
      req.collectionName,
      req.dbName,
    );
  }

  private getCachedResults(req: Request): any {
    return this.cache.get(
      JSON.stringify(req.request),
      req.collectionName,
      req.dbName,
    );
  }

  private cacheResults(req: Request, results: any): void {
    this.cache.set(
      JSON.stringify(req.request),
      req.collectionName,
      req.dbName,
      results,
    );
  }
}

function parsePipeline(pipeline: any): any[] {
  try {
    return parse('[' + objectToString(pipeline[0]) + ']');
  } catch (e) {
    console.debug('Parsing error on pipeline');
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
