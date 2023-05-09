import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import * as net from 'net';
import * as tls from 'tls';
import { EventEmitter } from 'events';
import {
  RequestInterceptor,
  RequestInterceptorHook,
} from './interceptors/request.interceptor';
import { Transform } from 'stream';
import { decodeMessage } from './protocol/protocol';
import {
  ReplyInterceptor,
  ReplyInterceptorHook,
} from './interceptors/response.interceptor';
import { RequestService } from '../request/request.service';
import { LoggerService } from '../logger/logger.service';
import fs from 'fs';

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
   * The hostname or IP address for the proxy server to listen on for incoming connections
   */
  listenHost: string;
  /**
   * The port number for the proxy server to listen on for incoming connections
   */
  listenPort: number;
};

/**
 * Hook functions to modify incoming/outgoing data on the proxy
 */
export interface MongoDBProxyListener {
  onRequest: RequestInterceptorHook;
  onResult: ReplyInterceptorHook;
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
  private sslOptions: tls.SecureContextOptions | null;

  constructor(
    @Inject(RequestService) private readonly requestService: RequestService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {
    super();
    this.loadConfig(config);
    this.init();
    this.start();
    this.logger.setContext('ProxyService');
  }

  init() {
    const createServerCallback = async (socket: net.Socket) => {
      const proxySocket = tls.connect(
        this.options.targetPort,
        this.options.targetHost,
        { servername: this.options.targetHost, rejectUnauthorized: false },
        () => {
          this.logger.success('Connected to target server');
        },
      );
      // Setup aggregate interceptor (client -> proxy)
      const aggregateInterceptor = new RequestInterceptor(socket);
      aggregateInterceptor.registerHook((hook) =>
        this.requestService.onRequest(hook),
      );
      // Setup result interceptor (proxy -> client)
      const resultInterceptor = new ReplyInterceptor();
      resultInterceptor.registerHook((hook) =>
        this.requestService.onResult(hook),
      );
      // Setup bidirectional data flow between client, interceptors and proxy
      socket.pipe(aggregateInterceptor).pipe(proxySocket);
      proxySocket.pipe(resultInterceptor).pipe(socket);
      // Handle errors
      proxySocket.on('error', handleError);
      socket.on('error', handleError);
    };
    if (this.sslOptions) {
      this.server = tls.createServer(this.sslOptions, createServerCallback);
    } else {
      this.server = net.createServer(createServerCallback);
    }

    const mode = this.sslOptions ? 'SSL' : 'non-SSL';
    this.logger.log(`Proxy running in ${mode} mode`);

    return this;
  }

  /**
   * Starts the TcpProxy instance and begins listening for incoming connections.
   */
  start() {
    this.server.listen(this.options.listenPort, () => {
      this.emit('listening');
      const port = this.getProxyPort();
      const host = this.getProxyHost();
      this.logger.success(
        `Maggregor proxy is now running at: mongodb://${host}:${port}/`,
      );
    });
  }

  /**
   * Stops the TcpProxy instance and closes all connected clients and the listening socket.
   */
  stop() {
    this.server.close();
    this.emit('closed');
  }

  /**
   * Gets the port number the proxy is listening on
   */
  getProxyPort() {
    return this.options.listenPort;
  }

  /**
   * Gets the host the proxy is listening on
   */
  getProxyHost() {
    return this.options.listenHost;
  }

  /**
   * Gets the target host the proxy is proxying requests to
   */
  getTargetHost() {
    return this.options.targetHost;
  }

  /**
   * Gets the target port the proxy is proxying requests to
   */
  getTargetPort() {
    return this.options.targetPort;
  }

  /**
   * Loads the proxy configuration from the environment variables
   */
  private loadConfig(config: ConfigService) {
    const listenHost = config.get('HOST') || 'localhost';
    const listenPort = config.get('PROXY_PORT') || 4000;
    const uri = config.get('MONGODB_TARGET_URI') || 'mongodb://localhost:27017';
    const mongodbConnection = parseMongoDBConnectionString(uri);
    const targetHost = mongodbConnection.host;
    const targetPort = mongodbConnection.port || 27017;
    this.options = {
      targetPort,
      targetHost,
      listenHost,
      listenPort,
    };

    const useSSL = config.get('USE_SSL') === 'true';
    if (useSSL) {
      const sslKeyPath = config.get('SSL_KEY_PATH');
      const sslCertPath = config.get('SSL_CERT_PATH');
      if (!sslKeyPath || !sslCertPath) {
        throw new Error('SSL key and certificate paths must be provided');
      }
      this.sslOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
      };
    } else {
      this.sslOptions = null;
    }
  }
}

function handleError(err: Error) {
  // Ignore disconnection errors
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Code is not in the type definition
  if (err.code === 'ECONNRESET') {
    return;
  }
  console.error(err);
}

interface MongoDBConnectionInfo {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  replicaSet?: string;
}

/**
 * Parses a MongoDB connection string into its individual components
 *
 * Support the following connection string format:
 * mongodb://[username:password@]host1[:port1][,host2[:port2],…]/database?replicaSet=replicaSetName
 *
 * @param connectionString The MongoDB connection string to parse
 * @returns The parsed connection information
 */
function parseMongoDBConnectionString(
  connectionString: string,
): MongoDBConnectionInfo {
  // Find the first host in the connection string
  const mainUrl = connectionString.split(',')[0];
  const url = new URL(mainUrl);
  const [, username, password] = url.username.split(':');
  const replicaSetParam = connectionString.match(/replicaSet=([^&]+)/);
  const replicaSet = replicaSetParam ? replicaSetParam[1] : undefined;

  return {
    host: url.hostname,
    port: parseInt(url.port),
    database: url.pathname.slice(1),
    username,
    password,
    replicaSet,
  };
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
