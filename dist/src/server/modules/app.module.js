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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const listener_module_1 = require("./mongodb-listener/listener.module");
const common_1 = require("@nestjs/common");
const database_module_1 = require("./database/database.module");
const request_module_1 = require("./request/request.module");
const proxy_module_1 = require("./mongodb-proxy/proxy.module");
const config_1 = require("@nestjs/config");
const Joi = __importStar(require("joi"));
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string()
                        .valid('development', 'production', 'test')
                        .default('development'),
                    PROXY_PORT: Joi.number().default(4000),
                    HOST: Joi.string().default('localhost'),
                    HTTP_PORT: Joi.number().default(3000),
                    HTTP_HOST: Joi.string().default('localhost'),
                    MONGODB_TARGET_URI: Joi.string()
                        .empty('')
                        .default('mongodb://localhost:27017'),
                    MONGODB_METADATA_URI: Joi.string().empty('').optional(),
                }),
                validationOptions: {
                    abortEarly: true,
                },
                envFilePath: process.env.NODE_ENV === 'production'
                    ? '.env.prod'
                    : process.env.NODE_ENV === 'test'
                        ? '.env.test'
                        : '.env',
            }),
            database_module_1.DatabaseModule,
            request_module_1.RequestModule,
            proxy_module_1.ProxyModule,
            listener_module_1.ListenerModule,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map