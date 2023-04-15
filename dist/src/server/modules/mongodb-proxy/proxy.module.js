"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const proxy_service_1 = require("./proxy.service");
const request_module_1 = require("../request/request.module");
const request_service_1 = require("../request/request.service");
const request_schema_1 = require("../request/request.schema");
const database_module_1 = require("../database/database.module");
const config_1 = require("@nestjs/config");
const logger_service_1 = require("../logger/logger.service");
const logger_module_1 = require("../logger/logger.module");
let ProxyModule = class ProxyModule {
};
ProxyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            logger_module_1.LoggerModule,
            config_1.ConfigModule,
            database_module_1.DatabaseModule,
            request_module_1.RequestModule,
            mongoose_1.MongooseModule.forFeature([{ name: request_schema_1.Request.name, schema: request_schema_1.RequestSchema }]),
        ],
        controllers: [],
        providers: [logger_service_1.LoggerService, proxy_service_1.MongoDBTcpProxyService, request_service_1.RequestService],
    })
], ProxyModule);
exports.ProxyModule = ProxyModule;
//# sourceMappingURL=proxy.module.js.map