"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBTcpProxyService = void 0;
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const net = __importStar(require("net"));
const events_1 = require("events");
const aggregate_interceptor_1 = require("./interceptors/aggregate.interceptor");
const stream_1 = require("stream");
const protocol_1 = require("./protocol/protocol");
const reply_interceptor_1 = require("./interceptors/reply-interceptor");
const request_service_1 = require("../request/request.service");
const logger_service_1 = require("../logger/logger.service");
let MongoDBTcpProxyService = class MongoDBTcpProxyService extends events_1.EventEmitter {
    constructor(requestService, config, logger) {
        super();
        this.requestService = requestService;
        this.config = config;
        this.logger = logger;
        this.loadConfig(config);
        this.init();
        this.start();
        this.logger.setContext('ProxyService');
    }
    init() {
        this.server = net.createServer(async (socket) => {
            const proxySocket = new net.Socket();
            const aggregateInterceptor = new aggregate_interceptor_1.AggregateInterceptor(socket);
            aggregateInterceptor.registerHook((hook) => this.requestService.onAggregateQueryFromClient(hook));
            const resultInterceptor = new reply_interceptor_1.ReplyInterceptor();
            resultInterceptor.registerHook((hook) => this.requestService.onResultFromServer(hook));
            socket.pipe(aggregateInterceptor).pipe(proxySocket);
            proxySocket.pipe(resultInterceptor).pipe(socket);
            proxySocket.on('error', handleError);
            socket.on('error', handleError);
            proxySocket.connect(this.options.targetPort, this.options.targetHost);
        });
        return this;
    }
    start() {
        this.server.listen(this.options.listenPort, () => {
            this.emit('listening');
            const port = this.getProxyPort();
            const host = this.getProxyHost();
            this.logger.success(`Maggregor proxy is now running at: mongodb://${host}:${port}/`);
        });
    }
    stop() {
        this.server.close();
        this.emit('closed');
    }
    getProxyPort() {
        return this.options.listenPort;
    }
    getProxyHost() {
        return this.options.listenHost;
    }
    getTargetHost() {
        return this.options.targetHost;
    }
    getTargetPort() {
        return this.options.targetPort;
    }
    loadConfig(config) {
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
    }
};
MongoDBTcpProxyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(request_service_1.RequestService)),
    __param(1, (0, common_1.Inject)(config_1.ConfigService)),
    __param(2, (0, common_1.Inject)(logger_service_1.LoggerService)),
    __metadata("design:paramtypes", [request_service_1.RequestService,
        config_1.ConfigService,
        logger_service_1.LoggerService])
], MongoDBTcpProxyService);
exports.MongoDBTcpProxyService = MongoDBTcpProxyService;
function handleError(err) {
    if (err.code === 'ECONNRESET') {
        return;
    }
    console.error(err);
}
function parseMongoDBConnectionString(connectionString) {
    const url = new URL(connectionString);
    const [, username, password] = url.username.split(':');
    return {
        host: url.hostname,
        port: parseInt(url.port),
        database: url.pathname.slice(1),
        username,
        password,
    };
}
function createStreamLogger(name) {
    return new stream_1.Transform({
        transform: async (chunk, encoding, callback) => {
            try {
                console.debug(name, JSON.stringify((0, protocol_1.decodeMessage)(chunk)));
            }
            catch (e) {
                console.debug(name, "Can't decode message, opcode:", chunk.readUInt32LE(0));
            }
            callback(null, chunk);
        },
    });
}
//# sourceMappingURL=proxy.service.js.map