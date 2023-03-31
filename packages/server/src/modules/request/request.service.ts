import { Injectable } from '@nestjs/common';
import { Request } from './request.interface';
import { RequestModel } from './request.model';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { InterceptedAggregate } from '../mongodb-proxy/interceptors/aggregate.interceptor';
import { MessageResultConfig } from '../mongodb-proxy/protocol';

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

  async onAggregateQueryFromClient(
    intercepted: InterceptedAggregate,
  ): Promise<MessageResultConfig> {
    return;
  }

  async onResultFromServer(intercepted: InterceptedAggregate): Promise<void> {
    return;
  }
}
