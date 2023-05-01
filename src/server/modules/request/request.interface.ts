// Differents sources of request results.
// Sources:
// - cache: src/server/modules/cache/cache.ts (when the request is answered from the Maggregor cache)
// - mongodb: src/server/modules/request/request.service.ts (when the request is delegated to the server)
// - intercept: src/server/modules/request/request.service.ts (when the request is intercepted by the Maggregor)
export type RequestSourceType = 'cache' | 'mongodb' | 'intercept';
export type RequestType =
  | 'find'
  | 'aggregate'
  | 'count'
  | 'distinct'
  | 'unknown';
export interface IRequest {
  // The request id is a unique number that is generated by the client and is used to identify a request.
  requestID: number;
  // The db name where the request is made.
  db: string;
  // The collection name where the request is made.
  collName: string;
  // The start time of the request.
  startAt?: Date;
  // The end time of the request.
  endAt?: Date;
  // For `aggregate` requests, the pipeline is the aggregation pipeline.
  pipeline?: Record<string, unknown>[];
  // For `find` requests, the filter is the query object.
  filter?: Record<string, unknown>;
  // For `count` requests, the query is the query object.
  query?: Record<string, unknown>;
  // For `distinct` requests, the key is the field name.
  key?: string;
  // For read requests except `aggregate`, the limit is the maximum number of documents to return.
  limit?: number;
  // The source of the request results.
  requestSource?: RequestSourceType;
  // The type of the request.
  type: RequestType;
}
