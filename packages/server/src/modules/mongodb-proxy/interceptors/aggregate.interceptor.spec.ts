import {
  AggregateInterceptor,
  InterceptedAggregate,
} from './aggregate.interceptor';
import { MongoDBMessage, encodeMessage } from '../protocol';

describe('AggregateInterceptor', () => {
  let interceptor: AggregateInterceptor;
  let socket: jest.Mocked<any>;

  beforeEach(() => {
    socket = jest.fn() as any;
    socket.write = jest.fn((buffer: Buffer) => buffer);

    interceptor = new AggregateInterceptor(socket);
  });

  test('Register hook', () => {
    const hook = async (intercepted: InterceptedAggregate) => null;
    interceptor.registerHook(hook);
    expect(interceptor.hooks.length).toBe(1);
    expect(interceptor.hooks[0]).toBe(hook);
  });

  test('Hook is called', async () => {
    const hook = jest.fn(async (intercepted: InterceptedAggregate) => ({
      db: 'testDB',
      collection: 'testCollection',
      results: [],
      responseTo: 12345,
    }));

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

    interceptor.write(buffer);

    expect(hook).toHaveBeenCalled();
  });
});
