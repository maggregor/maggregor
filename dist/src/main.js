"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./server/modules/app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error'],
    });
    common_1.Logger.log('Starting Maggregor...');
    await app.listen(process.env.HTTP_PORT || 3000, process.env.HTTP_HOST || 'localhost');
    common_1.Logger.log('Maggregor is running. Waiting for connections...');
}
exports.bootstrap = bootstrap;
bootstrap();
//# sourceMappingURL=main.js.map