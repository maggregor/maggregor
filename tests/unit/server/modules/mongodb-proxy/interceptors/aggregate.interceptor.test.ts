import { AggregateInterceptor } from '@server/modules/mongodb-proxy/interceptors/aggregate.interceptor';
import {
  MongoDBMessage,
  encodeMessage,
} from '@server/modules/mongodb-proxy/protocol';
import * as net from 'net';

describe('AggregateInterceptor', () => {
  let interceptor: AggregateInterceptor;
  let socket: net.Socket;

  beforeEach(() => {
    socket = new net.Socket();

    interceptor = new AggregateInterceptor(socket);
  });

  test('Hook is called', async () => {
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
  });
});
