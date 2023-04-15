"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestModule = void 0;
const common_1 = require("@nestjs/common");
const request_service_1 = require("./request.service");
const request_schema_1 = require("./request.schema");
const mongoose_1 = require("@nestjs/mongoose");
const database_module_1 = require("../database/database.module");
const config_1 = require("@nestjs/config");
let RequestModule = class RequestModule {
};
RequestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            database_module_1.DatabaseModule,
            mongoose_1.MongooseModule.forFeature([{ name: request_schema_1.Request.name, schema: request_schema_1.RequestSchema }]),
        ],
        providers: [request_service_1.RequestService],
        controllers: [],
    })
], RequestModule);
exports.RequestModule = RequestModule;
//# sourceMappingURL=request.module.js.map