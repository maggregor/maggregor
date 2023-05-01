import { RequestInterceptor } from '@/server/modules/mongodb-proxy/interceptors/request.interceptor';
import {
  MongoDBMessage,
  MsgResult,
  encodeMessage,
  encodeResults,
} from '@server/modules/mongodb-proxy/protocol';
import { PassThrough } from 'stream';
const EXAMPLE_MSG: MongoDBMessage = {
  header: {
    requestID: 12345,
    responseTo: 0,
    opCode: 2013,
  },
  contents: {
    flagBits: 0,
    sections: [
      {
        kind: 0,
        payload: {
          aggregate: 'testCollection',
          pipeline: [],
          cursor: {},
          $db: 'testDB',
        },
      },
    ],
  },
};

describe('AggregateInterceptor', () => {
  let interceptor: RequestInterceptor;

  beforeEach(() => {
    interceptor = new RequestInterceptor({ write: vi.fn() } as any);
  });

  test('Hook is called', async () => {
    const result = {
      db: 'testDB',
      collection: 'testCollection',
      results: [
        {
          _id: 'test',
          count: 1,
        },
      ],
      responseTo: 0,
    } as MsgResult;
    const hook = vi.fn().mockReturnValue(result);
    interceptor.registerHook(hook);
    const buffer = encodeMessage(EXAMPLE_MSG);
    interceptor.write(buffer);
    expect(hook).toHaveBeenCalledTimes(1);
  });

  test('The buffer go trough if no hook is registered', async () => {
    const buffer = encodeMessage(EXAMPLE_MSG);
    interceptor.pipe(
      new PassThrough({
        transform(chunk: any) {
          expect(chunk).toEqual(buffer);
        },
      }),
    );
    interceptor.write(buffer);
  });

  test('The buffer go trough if no hook returns a result', async () => {
    const hook = vi.fn().mockReturnValue(null);
    interceptor.registerHook(hook);
    const buffer = encodeMessage(EXAMPLE_MSG);
    interceptor.pipe(
      new PassThrough({
        transform(chunk: any) {
          expect(chunk).toEqual(buffer);
        },
      }),
    );
    interceptor.write(buffer);
  });

  test('The buffer replaced by the result if a hook returns a result', async () => {
    const result = {
      db: 'testDB',
      collection: 'testCollection',
      results: [
        {
          _id: 'test',
          count: 10,
        },
      ],
      responseTo: 0,
    } as MsgResult;
    const hook = vi.fn().mockReturnValue(result);
    interceptor.registerHook(hook);
    const buffer = encodeMessage(EXAMPLE_MSG);
    interceptor.pipe(
      new PassThrough({
        transform(chunk: any) {
          expect(chunk).toEqual(encodeResults(result));
        },
      }),
    );
    interceptor.write(buffer);
  });
});
