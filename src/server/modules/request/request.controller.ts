import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { Request } from './request.schema';
import { IRequest } from './request.interface';

@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  async create(@Body() request: IRequest): Promise<Request> {
    return this.requestService.create(request);
  }

  @Get()
  async findAll(): Promise<Request[]> {
    return this.requestService.findAll();
  }

  @Get(':requestID')
  async findOneByRequestId(
    @Param('requestID') requestID: number,
  ): Promise<Request> {
    return this.requestService.findOneByRequestId(requestID);
  }
  @Delete()
  async deleteAll(): Promise<{ deletedCount: number }> {
    return this.requestService.deleteAll();
  }

  @Put()
  async updateOne(@Body() request: IRequest): Promise<Request> {
    return this.requestService.updateOne(request);
  }

  @Delete(':requestID')
  async deleteByRequestID(
    @Param('requestID') requestID: number,
  ): Promise<Request> {
    return this.requestService.deleteByRequestID(requestID);
  }
}
