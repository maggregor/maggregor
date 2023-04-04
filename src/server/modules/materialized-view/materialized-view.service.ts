import { Injectable } from '@nestjs/common';
import { MaterializedView } from './materialized-view.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MaterializedViewService {
  constructor(
    @InjectModel(MaterializedView.name)
    private readonly materializedViewModel: Model<MaterializedView>,
  ) {}

  async create(request: MaterializedView): Promise<MaterializedView> {
    return this.materializedViewModel.create(request);
  }

  async findAll(): Promise<MaterializedView[]> {
    return this.materializedViewModel.find();
  }

  async findOne(id: string): Promise<MaterializedView> {
    return this.materializedViewModel.findOne({ _id: id });
  }

  async update(
    id: string,
    request: MaterializedView,
  ): Promise<MaterializedView> {
    await this.materializedViewModel.updateOne({ _id: id }, request);
    return this.findOne(id);
  }

  async delete(id: string): Promise<MaterializedView> {
    return this.materializedViewModel.findByIdAndDelete(id);
  }
}
