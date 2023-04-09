import { AggregateInterceptor } from '@server/modules/mongodb-proxy/interceptors/aggregate.interceptor';
import {
  MongoDBMessage,
  MsgResult,
  encodeMessage,
} from '@server/modules/mongodb-proxy/protocol';
import * as net from 'net';
import { PassThrough } from 'stream';

describe('AggregateInterceptor', () => {
  let interceptor: AggregateInterceptor;

  beforeEach(() => {
    interceptor = new AggregateInterceptor({ write: vi.fn() } as any);
  });

  test('Hook is called', async () => {
    const hook = vi.fn().mockReturnValue({
      db: 'testDB',
      collection: 'testCollection',
      results: [
        {
          _id: 'test',
          count: 1,
        },
      ],
      responseTo: 0,
    } as MsgResult);
    interceptor.registerHook(hook);
    const testMessage: MongoDBMessage = {
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

    const buffer = encodeMessage(testMessage);

    interceptor.pipe(
      new PassThrough({
        transform(chunk, encoding, callback) {
          expect(chunk).toEqual(buffer);
          this.push(chunk);
          callback();
        },
      }),
    );
    interceptor.write(buffer);
    expect(hook).toHaveBeenCalledTimes(1);
  });
});
