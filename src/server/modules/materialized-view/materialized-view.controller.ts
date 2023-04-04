import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MaterializedView } from './materialized-view.schema';
import { MaterializedViewService } from './materialized-view.service';

@Controller('request')
export class MaterializedViewController {
  constructor(private readonly requestService: MaterializedViewService) {}

  @Post()
  async create(@Body() request: MaterializedView): Promise<MaterializedView> {
    return this.requestService.create(request);
  }

  @Get()
  async findAll(): Promise<MaterializedView[]> {
    return this.requestService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MaterializedView> {
    return this.requestService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: MaterializedView,
  ): Promise<MaterializedView> {
    return this.requestService.update(id, request);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<MaterializedView> {
    return this.requestService.delete(id);
  }
}
