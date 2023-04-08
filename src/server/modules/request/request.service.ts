import { InMemoryCache } from '@core/cache';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { InterceptedAggregate } from '../mongodb-proxy/interceptors/aggregate.interceptor';
import { MessageResultConfig } from '../mongodb-proxy/protocol/protocol';
import { InterceptedReply } from '../mongodb-proxy/interceptors/reply-interceptor';
import { parse } from '@parser/mongo-aggregation-parser';
import { Request } from './request.schema';

@Injectable()
export class RequestService implements MongoDBProxyListener {
  private cache: InMemoryCache = new InMemoryCache(512);

  constructor(
    @InjectModel(Request.name) private readonly requestModel: Model<Request>,
  ) {}

  async create(request: Request): Promise<Request> {
    return this.requestModel.create(request);
  }

  async findAll(): Promise<Request[]> {
    return this.requestModel.find();
  }

  async findOne(id: string): Promise<Request> {
    return this.requestModel.findOne({ _id: id });
  }

  async update(id: string, request: Request): Promise<Request> {
    await this.requestModel.updateOne({ _id: id }, request);
    return this.findOne(id);
  }

  async delete(id: string): Promise<Request> {
    return this.requestModel.findByIdAndDelete(id);
  }

  // Event: on aggregate query from client
  async onAggregateQueryFromClient(
    intercepted: InterceptedAggregate,
  ): Promise<MessageResultConfig> {
    const pipeline = intercepted.pipeline;
    const parsedPipeline = parsePipeline(pipeline);
    const reqId = intercepted.requestID;
    const stageCount = parsedPipeline.length;
    const db = intercepted.dbName;
    const collection = intercepted.collectionName;
    const pipelineString = JSON.stringify(parsedPipeline);
    if (this.cache.get(pipelineString, collection, db)) {
      // ANSWER THE REQUEST WITH THE CACHE
      return null;
    }
    Logger.log(`=> Request ${reqId}: Pipeline (${stageCount} stage(s))`);
    // Return null so let the request go through
    return null;
  }

  // Event: on result from server
  async onResultFromServer(intercepted: InterceptedReply): Promise<void> {
    const id = intercepted.responseTo.toString();
    const find = await this.findOne(id);
    this.update(id, {
      ...find,
      endAt: new Date(),
    });
    // Cache the result
    this.cache.set(
      find.request,
      find.collectionName,
      find.dbName,
      intercepted.data,
    );
    const resId = intercepted.responseTo;
    const documentCount = intercepted.data.length;
    Logger.log(`<= Response ${resId}: ${documentCount} documents`);
    return;
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
