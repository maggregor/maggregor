"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateInterceptor = void 0;
const protocol_1 = require("../protocol");
const stream_1 = require("stream");
class AggregateInterceptor extends stream_1.Transform {
    constructor(socket) {
        super();
        this.socket = socket;
        this.hooks = [];
    }
    registerHook(hook) {
        hook && this.hooks.push(hook);
    }
    async _transform(chunk, encoding, callback) {
        const buffer = Buffer.from(chunk);
        try {
            const msg = (0, protocol_1.decodeMessage)(buffer);
            const payload = msg.contents.sections[0].payload;
            const { pipeline } = payload;
            const requestID = msg.header.requestID;
            const collectionName = payload.aggregate;
            const dbName = payload.$db;
            if (pipeline) {
                const intercepted = {
                    requestID,
                    dbName,
                    collectionName,
                    pipeline,
                };
                let result;
                for (const hook of this.hooks) {
                    result = await hook(intercepted);
                    if (result) {
                        let resultBuffer = (0, protocol_1.encodeResults)(result);
                        this.socket.write(resultBuffer);
                        callback();
                        return;
                    }
                }
            }
        }
        catch (e) { }
        this.push(chunk);
        callback();
    }
}
exports.AggregateInterceptor = AggregateInterceptor;
//# sourceMappingURL=aggregate.interceptor.js.map