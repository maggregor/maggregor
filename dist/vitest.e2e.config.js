"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const vitest_config_1 = __importDefault(require("./vitest.config"));
exports.default = (0, config_1.mergeConfig)(vitest_config_1.default, {
    test: {
        include: ['**/tests/e2e/**/*.test.ts'],
        hookTimeout: 20000,
        testTimeout: 60000,
        setupFiles: ['./tests/e2e/setup.ts'],
    },
});
//# sourceMappingURL=vitest.e2e.config.js.map