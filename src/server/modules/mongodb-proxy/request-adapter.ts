/**
 * This file contains the types and functions for converting between
 * the payload sent by the client and the Request object used by Maggregor.
 */

import { IRequest, RequestType } from '../request/request.interface';
export type MsgRequestType = 'find' | 'aggregate' | 'count';

/**
 * Represents the payload of read requests from the client to the proxy.
 */
export type Payload = {
  db: string;
  find?: string;
  aggregate?: string;
  count?: string;
  filter?: Record<string, unknown>;
  pipeline?: Record<string, unknown>[];
  query?: Record<string, unknown>;
  limit?: number;
};

/**
 * Converts a payload from a client message to a Request object.
 *
 * @param requestID The ID of the request
 * @param payload The payload of the request
 * @returns The Request object
 */
export const handlePayload = (
  requestID: number,
  payload: Payload,
): IRequest => {
  const { find, aggregate, count, db, filter, pipeline, query } = payload;
  const collection = find || aggregate || count;
  const type = resolveType(payload);
  return {
    requestID,
    db,
    collName: collection,
    pipeline,
    filter,
    query,
    limit: payload.limit,
    requestSource: null,
    type,
  } as IRequest;
};

/**
 * Resolves the type of a request from its payload.
 *
 * @param payload  The payload of the request
 * @returns
 */
export const resolveType = (payload: Payload): RequestType => {
  if (payload.find) {
    return 'find';
  }
  if (payload.aggregate) {
    return 'aggregate';
  }
  if (payload.count) {
    return 'count';
  }
  return 'unknown';
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
