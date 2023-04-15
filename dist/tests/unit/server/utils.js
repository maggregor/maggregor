"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProxyServiceTest = void 0;
const logger_module_1 = require("../../../src/server/modules/logger/logger.module");
const proxy_service_1 = require("../../../src/server/modules/mongodb-proxy/proxy.service");
const request_service_1 = require("../../../src/server/modules/request/request.service");
const config_1 = require("@nestjs/config");
const testing_1 = require("@nestjs/testing");
async function createProxyServiceTest(opts) {
    const app = await testing_1.Test.createTestingModule({
        imports: [logger_module_1.LoggerModule],
        providers: [
            proxy_service_1.MongoDBTcpProxyService,
            {
                provide: request_service_1.RequestService,
                useValue: {},
            },
            {
                provide: config_1.ConfigService,
                useValue: {
                    get: (key) => {
                        return opts.env[key];
                    },
                },
            },
        ],
    }).compile();
    return app.get(proxy_service_1.MongoDBTcpProxyService);
}
exports.createProxyServiceTest = createProxyServiceTest;
//# sourceMappingURL=utils.js.map