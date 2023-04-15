"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const chalk_1 = __importDefault(require("chalk"));
let LoggerService = class LoggerService extends common_1.ConsoleLogger {
    getTimeStamp() {
        const now = new Date();
        const year = now.getFullYear().toString().padStart(4, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hour = now.getHours().toString().padStart(2, '0');
        const minute = now.getMinutes().toString().padStart(2, '0');
        const timestamp = `${year}-${month}-${day} ${hour}:${minute}`;
        return timestamp;
    }
    buildMessage(color, message) {
        const timestamp = chalk_1.default[color](`[${this.getTimeStamp()}]`);
        const ctx = this.context ? chalk_1.default.gray(`[${this.context}]`) : '';
        const msg = chalk_1.default[color](message);
        return `${timestamp} ${ctx} ${msg}`;
    }
    log(message) {
        console.log(this.buildMessage('white', message));
    }
    error(message) {
        console.error(this.buildMessage('red', message));
    }
    warn(message) {
        console.warn(this.buildMessage('yellow', message));
    }
    debug(message) {
        console.debug(this.buildMessage('blue', message));
    }
    verbose(message) {
        console.log(this.buildMessage('whiteBright', message));
    }
    success(message) {
        console.log(this.buildMessage('green', message));
    }
};
LoggerService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT })
], LoggerService);
exports.LoggerService = LoggerService;
//# sourceMappingURL=logger.service.js.map