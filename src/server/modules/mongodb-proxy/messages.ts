export type MsgRequestType = 'find' | 'aggregate' | 'count';

export interface BaseMsgRequest {
  requestID: number;
  dbName: string;
  collectionName: string;
}

export interface FindMsgRequest extends BaseMsgRequest {
  type: 'find';
  filter: Record<string, unknown>;
}

export interface AggregateMsgRequest extends BaseMsgRequest {
  type: 'aggregate';
  pipeline: unknown[];
}

export interface CountMsgRequest extends BaseMsgRequest {
  type: 'count';
  query: Record<string, unknown>;
}

export type MsgRequest = FindMsgRequest | AggregateMsgRequest | CountMsgRequest;

type Payload = {
  dbName: string;
  find?: string;
  aggregate?: string;
  count?: string;
  filter?: Record<string, unknown>;
  pipeline?: unknown[];
  query?: Record<string, unknown>;
};

export const handleRequestPayload = (
  requestID: number,
  payload: Payload,
): MsgRequest => {
  const { find, aggregate, count, dbName, filter, pipeline, query } = payload;

  if (find) {
    return {
      requestID,
      type: 'find',
      collectionName: find,
      dbName,
      filter: filter as Record<string, unknown>,
    };
  } else if (aggregate) {
    return {
      requestID,
      type: 'aggregate',
      collectionName: aggregate,
      dbName,
      pipeline: pipeline as unknown[],
    };
  } else if (count) {
    return {
      requestID,
      type: 'count',
      collectionName: count,
      dbName,
      query: query as Record<string, unknown>,
    };
  } else {
    throw new Error('Unsupported message type');
  }
};

export interface MsgResponse {
  requestID: number;
  responseTo: number;
  data: unknown;
}

export interface MsgResult {
  db: string;
  collection: string;
  results: unknown[];
  responseTo: number;
}
