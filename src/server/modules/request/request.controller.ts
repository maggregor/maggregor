import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RequestService } from './request.service';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  async create(@Body() request: Request): Promise<Request> {
    return this.requestService.create(request);
  }

  @Get()
  async findAll(): Promise<Request[]> {
    return this.requestService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Request> {
    return this.requestService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: Request,
  ): Promise<Request> {
    return this.requestService.update(id, request);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Request> {
    return this.requestService.delete(id);
  }
}
