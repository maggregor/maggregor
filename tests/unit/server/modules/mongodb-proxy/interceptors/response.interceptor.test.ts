import {
  ResponseInterceptor,
  ResponseInterceptorHook,
} from '@/server/modules/mongodb-proxy/interceptors/response.interceptor';
import {
  MongoDBMessage,
  encodeMessage,
} from '@/server/modules/mongodb-proxy/protocol';
import { mockedSession } from 'tests/unit/server/mocks';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;

  beforeEach(() => {
    interceptor = new ResponseInterceptor(mockedSession);
  });

  it('should trigger registered hooks with resolved response', async () => {
    // Create a sample message
    const OP_MSG_1: MongoDBMessage = {
      header: {
        requestID: 123,
        responseTo: 0,
        opCode: 2013, // OP_MSG
      },
      contents: {
        flagBits: 0,
        sections: [
          {
            kind: 0, // Body section
            payload: {
              hello: 'world',
            },
          },
        ],
      },
    };
    const buffer = encodeMessage(OP_MSG_1);
    const hook: ResponseInterceptorHook = vitest
      .fn()
      .mockImplementation(async () => null);
    interceptor.registerHook(hook);

    const onDataPromise = new Promise<void>((resolve) => {
      interceptor.on('data', () => {
        // Verify that the hook is called
        expect(hook).toHaveBeenCalledTimes(1);

        // Cleanup
        interceptor.end();
        resolve();
      });
    });

    // Simulate incoming data
    interceptor.write(buffer);
    await onDataPromise;
  });

  it('should not trigger hooks for non-OP_MSG messages', async () => {
    // Create a sample message with an incorrect opCode
    const header: any = {
      messageLength: 0,
      requestID: 1,
      responseTo: 0,
      opCode: 1234, // Not OP_MSG
    };

    const section: any = {
      kind: 0,
      payload: {
        type: 'Buffer',
        data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
      },
    };

    const buffer = Buffer.concat([
      Buffer.from(JSON.stringify(header)),
      Buffer.from(JSON.stringify(section)),
    ]);

    // Register a hook
    const hook: ResponseInterceptorHook = vitest
      .fn()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(async () => {});
    interceptor.registerHook(hook);

    const onDataPromise = new Promise<void>((resolve) => {
      interceptor.on('data', () => {
        // Verify that the hook is not called
        expect(hook).toHaveBeenCalledTimes(0);

        // Cleanup
        interceptor.end();
        resolve();
      });
    });

    // Simulate incoming data
    interceptor.write(buffer);
    await onDataPromise;
  });
});
