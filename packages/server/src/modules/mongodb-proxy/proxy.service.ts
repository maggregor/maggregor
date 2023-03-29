import { Injectable } from '@nestjs/common';
import * as net from 'net';
import { EventEmitter } from 'events';
import { InterceptedPipeline, PipelineInterceptor } from './interceptor';
import { Transform } from 'stream';
import { decodeMessage } from './protocol';

/**
 * Options for the TcpProxy instance
 */
export interface MongoDBProxyOptions {
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
}

/**
 * Hook functions to modify incoming/outgoing data on the proxy
 */
export interface MongoDBProxyHooks {
  /**
   * Function that is called with incoming client data and can modify the data before it is sent to the target
   * @param data - The incoming client data
   * @param socket - The client socket object
   * @returns The modified data to send to the target
   */
  clientData?: (data: Buffer, socket: net.Socket) => Promise<Buffer>;

  /**
   * Function that is called with incoming target data and can modify the data before it is sent to the client
   * @param data - The incoming target data
   * @param socket - The target socket object
   * @returns The modified data to send to the client
   */
  targetData?: (data: Buffer, socket: net.Socket) => Promise<Buffer>;

  /**
   * On receive message from client
   * @param data - The incoming client data
   * @param socket - The client socket object
   * @returns The modified data to send to the target
   */
}

/**
 * Event names emitted by the TcpProxy instance
 */
export interface TcpProxyEvents {
  /**
   * Emitted when data is received from a client
   */
  'client-data': (data: Buffer, socket: net.Socket) => void;
  /**
   * Emitted when data is received from the target server
   */
  'target-data': (data: Buffer, socket: net.Socket) => void;
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
  private hooks: MongoDBProxyHooks;

  /**
   * Creates an instance of TcpProxy.
   * @param options - The options for the TcpProxy instance.
   * @param hooks - The hooks for the TcpProxy instance.
   */
  constructor(options: MongoDBProxyOptions, hooks: MongoDBProxyHooks = {}) {
    super();
    this.options = options;
    this.hooks = hooks;
    this.server = net.createServer(async (socket) => {
      const proxySocket = new net.Socket();
      proxySocket.connect(
        this.options.targetPort,
        this.options.targetHost,
        () => {
          this.emit('target-connected');
        },
      );

      const interceptor = new PipelineInterceptor(socket);

      interceptor.registerHook((i: InterceptedPipeline) => {
        console.log(
          `Received: ${i.pipeline} on ${i.dbName}.${i.collectionName}`,
        );
        return null;
      });

      socket
        // Uncomment this line to log
        .pipe(createStreamLogger('client => server'))
        .pipe(interceptor)
        .pipe(proxySocket);

      proxySocket
        // Uncomment this line to log
        .pipe(createStreamLogger('server => client'))
        .pipe(socket);

      proxySocket.on('error', handleError);
      socket.on('error', handleError);
    });
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
   * Sets the hooks for the TcpProxy instance.
   * @param hooks - The hooks to set.
   * @returns The TcpProxy instance.
   * @example
   * const proxy = new TcpProxy({ targetHost: "localhost", targetPort: 8080, listenPort: 8081 });
   * proxy.setHooks({
   *  clientData: (data) => {
   *   return data.toString().replace("foo", "bar");
   * }
   * });
   */
  setHooks(hooks: MongoDBProxyHooks) {
    this.hooks = hooks;
  }

  /**
   * Gets the hooks for the TcpProxy instance.
   * @returns The hooks for the TcpProxy instance.
   */
  getHooks() {
    return this.hooks;
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
  if (err.code === 'EPIPE') {
    return;
  }
  console.error(err);
}

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
