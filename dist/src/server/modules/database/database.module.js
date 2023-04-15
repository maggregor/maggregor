"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_2 = require("@nestjs/config");
const mongodb_memory_server_1 = require("mongodb-memory-server");
let DatabaseModule = class DatabaseModule {
};
DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_2.ConfigModule,
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_2.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (config) => {
                    const mongodbUri = config.get('MONGODB_METADATA_URI');
                    if (!mongodbUri) {
                        const mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
                        const mongoUri = mongoServer.getUri();
                        return {
                            uri: mongoUri,
                        };
                    }
                    else {
                        return {
                            uri: mongodbUri,
                            useNewUrlParser: true,
                            useUnifiedTopology: true,
                        };
                    }
                },
            }),
        ],
        exports: [mongoose_1.MongooseModule],
    })
], DatabaseModule);
exports.DatabaseModule = DatabaseModule;
//# sourceMappingURL=database.module.js.map