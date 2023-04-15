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
import type { HydratedDocument } from 'mongoose';
import type { RequestInterface } from './request.interface';
export type RequestDocument = HydratedDocument<Request>;
export declare class Request implements RequestInterface {
    request: any;
    requestID: number;
    collectionName: string;
    dbName: string;
    startAt: Date;
    endAt?: Date;
    source?: 'cache' | 'delegate' | 'intercept';
}
export declare const RequestSchema: import("mongoose").Schema<Request, import("mongoose").Model<Request, any, any, any, import("mongoose").Document<unknown, any, Request> & Omit<Request & {
    _id: import("mongoose").Types.ObjectId;
}, never>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Request, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Request>> & Omit<import("mongoose").FlatRecord<Request> & {
    _id: import("mongoose").Types.ObjectId;
}, never>>;
