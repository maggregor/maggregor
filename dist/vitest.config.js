"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
    },
    resolve: {
        alias: {
            '@': (0, path_1.resolve)(__dirname, 'src'),
            '@server': (0, path_1.resolve)(__dirname, 'src/server'),
            '@parser': (0, path_1.resolve)(__dirname, 'src/parser'),
            '@core': (0, path_1.resolve)(__dirname, 'src/core'),
            '@client': (0, path_1.resolve)(__dirname, 'src/client'),
        },
    },
});
//# sourceMappingURL=vitest.config.js.map