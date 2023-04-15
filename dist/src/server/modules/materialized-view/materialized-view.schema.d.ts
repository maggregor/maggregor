/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { HydratedDocument } from 'mongoose';
import { MaterializedViewDefinition } from '@core/materialized-view';
import { AccumulatorDefinition } from '@core/pipeline/accumulators';
import { Expression } from '@core/pipeline/expressions';
export type MaterializedViewDocument = HydratedDocument<MaterializedView>;
export declare class MaterializedView implements MaterializedViewDefinition {
    groupBy: Expression;
    accumulatorDefs: AccumulatorDefinition[];
}
export declare const MaterializedViewSchema: import("mongoose").Schema<MaterializedView, import("mongoose").Model<MaterializedView, any, any, any, import("mongoose").Document<unknown, any, MaterializedView> & Omit<MaterializedView & {
    _id: import("mongoose").Types.ObjectId;
}, never>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MaterializedView, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<MaterializedView>> & Omit<import("mongoose").FlatRecord<MaterializedView> & {
    _id: import("mongoose").Types.ObjectId;
}, never>>;
