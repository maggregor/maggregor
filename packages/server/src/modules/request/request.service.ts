import { Injectable } from '@nestjs/common';
import { Request } from './request.interface';
import { RequestModel } from './request.model';

@Injectable()
export class RequestService {
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
}
