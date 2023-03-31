import { Inject, Injectable } from '@nestjs/common';
import * as net from 'net';
import { EventEmitter } from 'events';
import {
  AggregateInterceptor,
  AggregateInterceptorHook,
} from './interceptors/aggregate.interceptor';
import { Transform } from 'stream';
import { decodeMessage } from './protocol/protocol';
import {
  ReplyInterceptor,
  ReplyInterceptorHook,
} from './interceptors/reply-interceptor';
import { RequestService } from '../request/request.service';

/**
 * Options for the TcpProxy instance
 */
export type MongoDBProxyOptions = {
  /**
   * The hostname or IP address of the target server to proxy requests to
   */
  targetHost: string;
  /**
   * The port number of the target server to proxy requests to
   */
  targetPort: number;
  /**
   * The port number for the proxy server to listen on for incoming connections
   */
  listenPort: number;
};

/**
 * Hook functions to modify incoming/outgoing data on the proxy
 */
export interface MongoDBProxyListener {
  onAggregateQueryFromClient: AggregateInterceptorHook;
  onResultFromServer: ReplyInterceptorHook;
}

/**
 * Event names emitted by the TcpProxy instance
 */
export interface TcpProxyEvents {
  /**
   * Emitted when the proxy server has started listening for incoming connections
   */
  listening: () => void;
  /**
   * Emitted when the proxy server has been closed and all connections have been terminated
   */
  closed: () => void;
  /**
   * Emitted when an error occurs
   */
  error: (err: Error) => void;
}

@Injectable()
export class MongoDBTcpProxyService extends EventEmitter {
  private server: net.Server;
  private options: MongoDBProxyOptions;

  constructor(
    @Inject(RequestService) private readonly requestService: RequestService,
  ) {
    super();
  }

  initProxy(options: MongoDBProxyOptions) {
    this.options = options;
    this.server = net.createServer(async (socket) => {
      const proxySocket = new net.Socket();
      // Setup aggregate interceptor (client -> proxy)
      const aggregateInterceptor = new AggregateInterceptor(socket);
      aggregateInterceptor.registerHook(
        this.requestService.onAggregateQueryFromClient,
      );
      // Setup result interceptor (proxy -> client)
      const resultInterceptor = new ReplyInterceptor();
      resultInterceptor.registerHook(this.requestService.onResultFromServer);
      // Setup bidirectional data flow between client, interceptors and proxy
      socket.pipe(aggregateInterceptor).pipe(proxySocket);
      proxySocket.pipe(resultInterceptor).pipe(socket);
      // Handle errors
      proxySocket.on('error', handleError);
      socket.on('error', handleError);
      // Connect the new socket to the target server
      proxySocket.connect(this.options.targetPort, this.options.targetHost);
    });
    return this;
  }

  /**
   * Starts the TcpProxy instance and begins listening for incoming connections.
   */
  start() {
    this.server.listen(this.options.listenPort, () => this.emit('listening'));
  }

  /**
   * Stops the TcpProxy instance and closes all connected clients and the listening socket.
   */
  stop() {
    this.server.close();
    this.emit('closed');
  }

  /**
   * Gets the options for the TcpProxy instance.
   * @returns The options for the TcpProxy instance.
   */
  getListenPort() {
    return this.options.listenPort;
  }
}

function handleError(err: Error) {
  // Ignore disconnection errors
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Code is not in the type definition
  if (err.code === 'ECONNREFUSED') {
    return;
  }
  console.error(err);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createStreamLogger(name: string) {
  return new Transform({
    transform: async (chunk, encoding, callback) => {
      try {
        console.debug(name, JSON.stringify(decodeMessage(chunk)));
      } catch (e) {
        console.debug(
          name,
          "Can't decode message, opcode:",
          chunk.readUInt32LE(0),
        );
      }
      callback(null, chunk);
    },
  });
}
