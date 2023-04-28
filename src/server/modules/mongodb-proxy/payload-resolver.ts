/**
 * This file contains the types and functions for converting between
 * the payload sent by the client and the Request object used by Maggregor.
 */

import { IRequest, RequestType } from '../request/request.interface';
export type MsgRequestType = 'find' | 'aggregate' | 'count';

/**
 * Represents the payload of read requests
 */
export type RequestPayload = {
  $db: string;
  distinct?: string;
  find?: string;
  aggregate?: string;
  count?: string;
  key?: string;
  filter?: Record<string, unknown>;
  pipeline?: Record<string, unknown>[];
  query?: Record<string, unknown>;
  limit?: number;
};

/**
 * Represents the payload of responses
 */
export type ResponsePayload = {
  // For find and aggregate requests
  cursor?: {
    firstBatch: Record<string, unknown>[];
  };
  // For count requests
  n?: number;
  ok: number;
};

/**
 * Converts a payload from a client message to a Request object.
 *
 * @param requestID The ID of the request
 * @param payload The payload of the request
 * @returns The Request object
 */
export const resolveRequest = (
  requestID: number,
  payload: RequestPayload,
): IRequest => {
  const {
    find,
    aggregate,
    count,
    distinct,
    $db,
    filter,
    pipeline,
    query,
    key,
  } = payload;
  const collName = find || aggregate || count || distinct;
  const type = resolveRequestType(payload);
  return {
    requestID,
    db: $db,
    collName: collName,
    pipeline,
    filter,
    query,
    key,
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
export const resolveRequestType = (payload: RequestPayload): RequestType => {
  if (payload.find) {
    return 'find';
  }
  if (payload.aggregate) {
    return 'aggregate';
  }
  if (payload.count) {
    return 'count';
  }
  if (payload.distinct) {
    return 'distinct';
  }
  return 'unknown';
};

export const resolveResponse = (
  requestID: number,
  responseTo: number,
  payload: ResponsePayload,
): IResponse => {
  const { cursor } = payload;
  return {
    requestID,
    responseTo,
    // Retrieve the results from the cursor or the n field (count request)
    // TODO: Improve this
    data: cursor?.firstBatch || undefined,
  };
};

export interface IResponse {
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
