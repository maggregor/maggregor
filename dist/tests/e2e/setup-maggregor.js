"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaggregorProcess = void 0;
const child_process_1 = require("child_process");
class MaggregorProcess {
    start() {
        if (process.env.PNPM_HOME === undefined) {
            throw new Error('process.env.PNPM_HOME is undefined');
        }
        this.process = (0, child_process_1.spawn)(`${process.env.PNPM_HOME}/pnpm`, ['preview'], {
            detached: true,
            env: Object.assign(Object.assign({}, process.env), { NODE_ENV: 'test' }),
        });
    }
    stop() {
        this.process && process.kill(-this.process.pid);
    }
}
exports.MaggregorProcess = MaggregorProcess;
//# sourceMappingURL=setup-maggregor.js.map