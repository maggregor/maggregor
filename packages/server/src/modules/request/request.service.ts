import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { InterceptedAggregate } from '../mongodb-proxy/interceptors/aggregate.interceptor';
import { MessageResultConfig } from '../mongodb-proxy/protocol/protocol';
import { parse } from 'ts-mongo-aggregation-parser';
import { InterceptedReply } from '../mongodb-proxy/interceptors/reply-interceptor';

@Injectable()
export class RequestService implements MongoDBProxyListener {
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
    try {
      const sPipeline = '[' + objectToString(pipeline[0]) + ']';
      const parsed = parse(sPipeline);
      console.log(
        `Request ${intercepted.requestID} > Received pipeline: ${parsed
          .map((s) => s.type)
          .join(' -> ')}`,
      );
    } catch (e) {
      console.log('Parsing error on pipeline: ', e);
    }
    return;
  }

  // Event: on result from server
  async onResultFromServer(intercepted: InterceptedReply): Promise<void> {
    console.log(
      `Response to ${intercepted.responseTo} > Target server replied !`,
    );
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
