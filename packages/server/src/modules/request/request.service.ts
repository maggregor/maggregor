import { Injectable } from '@nestjs/common';
import { Request } from './request.interface';
import { RequestModel } from './request.model';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { InterceptedAggregate } from '../mongodb-proxy/interceptors/aggregate.interceptor';
import { MessageResultConfig } from '../mongodb-proxy/protocol';
import { parse } from 'ts-mongo-aggregation-parser';
@Injectable()
export class RequestService implements MongoDBProxyListener {
  constructor(private readonly requestModel: typeof RequestModel) {}

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
    this.update(id, request);
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
    try {
      const sPipeline = '[' + objectToString(pipeline[0]) + ']';
      console.log('Incoming aggregate pipeline: ', sPipeline);
      const parsed = parse(sPipeline);
      console.log('Parsed incoming aggregate pipeline: ', parsed);
    } catch (e) {
      console.log('Parsing error: ', e);
    }
    return;
  }

  // Event: on result from server
  async onResultFromServer(intercepted: InterceptedAggregate): Promise<void> {
    return;
  }
}

function objectToString(obj) {
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
