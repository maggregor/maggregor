"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBListenerService = void 0;
const mongodb_1 = require("mongodb");
const config_1 = require("@nestjs/config");
const events_1 = require("events");
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../logger/logger.service");
let MongoDBListenerService = class MongoDBListenerService extends events_1.EventEmitter {
    constructor(configService, logger) {
        super();
        this.configService = configService;
        this.logger = logger;
        this.startListen();
        this.logger.setContext('ListenerService');
    }
    async startListen() {
        let retries = 3;
        while (retries) {
            try {
                this.client = await mongodb_1.MongoClient.connect(this.configService.get('MONGODB_TARGET_URI'), {
                    connectTimeoutMS: 1000,
                    serverSelectionTimeoutMS: 1000,
                });
                this.client.db();
                this.logger.success('Successfully connected to the target MongoDB instance');
                return;
            }
            catch (error) {
                retries--;
                if (!retries) {
                    this.logger.error(`Failed to connect to the target MongoDB instance: ${error.message}`);
                }
                else {
                    this.logger.warn(`Failed to connect: retry connecting to MongoDB in 1 second...`);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }
        }
    }
};
MongoDBListenerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __param(1, (0, common_1.Inject)(logger_service_1.LoggerService)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        logger_service_1.LoggerService])
], MongoDBListenerService);
exports.MongoDBListenerService = MongoDBListenerService;
//# sourceMappingURL=listener.service.js.map