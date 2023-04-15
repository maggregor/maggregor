"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyInterceptor = void 0;
const stream_1 = require("stream");
const protocol_1 = require("../protocol");
let i = 0;
class ReplyInterceptor extends stream_1.PassThrough {
    constructor() {
        super();
        this.hooks = [];
    }
    registerHook(hook) {
        hook && this.hooks.push(hook);
    }
    async _transform(chunk, encoding, callback) {
        const buffer = Buffer.from(chunk);
        try {
            const msg = (0, protocol_1.decodeMessage)(buffer);
            const requestID = msg.header.requestID;
            const responseTo = msg.header.responseTo;
            if (msg.header.opCode === protocol_1.OP_MSG &&
                msg.contents.sections.length > 0 &&
                msg.contents.sections[0].payload.hasOwnProperty('cursor')) {
                const intercepted = {
                    requestID,
                    responseTo,
                    data: msg.contents.sections[0].payload.cursor.firstBatch,
                };
                for (const hook of this.hooks) {
                    hook(intercepted);
                }
            }
        }
        catch (e) { }
        this.push(chunk);
        callback();
    }
}
exports.ReplyInterceptor = ReplyInterceptor;
//# sourceMappingURL=reply-interceptor.js.map