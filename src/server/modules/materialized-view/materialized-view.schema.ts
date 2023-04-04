import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MaterializedViewDefinition } from '@core/materialized-view';
import { AccumulatorDefinition } from '@core/pipeline/accumulators';
import { Expression } from '@core/pipeline/expressions';

export type MaterializedViewDocument = HydratedDocument<MaterializedView>;

@Schema()
export class MaterializedView implements MaterializedViewDefinition {
  groupBy: Expression;
  accumulatorDefs: AccumulatorDefinition[];
}

export const MaterializedViewSchema =
  SchemaFactory.createForClass(MaterializedView);
