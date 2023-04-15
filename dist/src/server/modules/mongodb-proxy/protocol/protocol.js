"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeResults = exports.decodeMessage = exports.encodeMessage = exports.OP_REPLY = exports.OP_COMPRESSED = exports.OP_MSG = exports.OP_QUERY = void 0;
const bson_1 = require("bson");
const OP_REPLY = 1;
exports.OP_REPLY = OP_REPLY;
const OP_QUERY = 2004;
exports.OP_QUERY = OP_QUERY;
const OP_MSG = 2013;
exports.OP_MSG = OP_MSG;
const OP_COMPRESSED = 2012;
exports.OP_COMPRESSED = OP_COMPRESSED;
function encodeHeader(header, extraLength = 0) {
    const headerBuffer = Buffer.alloc(16);
    headerBuffer.writeInt32LE(extraLength + 16, 0);
    headerBuffer.writeInt32LE(header.requestID, 4);
    headerBuffer.writeInt32LE(header.responseTo, 8);
    headerBuffer.writeInt32LE(header.opCode, 12);
    return headerBuffer;
}
function decodeHeader(buffer) {
    return {
        messageLength: buffer.readInt32LE(0),
        requestID: buffer.readInt32LE(4),
        responseTo: buffer.readInt32LE(8),
        opCode: buffer.readInt32LE(12),
    };
}
function encodeOpQuery(message) {
    throw new Error('Not implemented');
}
function decodeOpQuery(buffer) {
    throw new Error('Not implemented');
}
function encodeOpMsg(message) {
    const sectionsBuffer = Buffer.concat(message.contents.sections.map((section) => {
        const kindBuffer = Buffer.from([section.kind]);
        const payloadBuffer = (0, bson_1.serialize)((0, bson_1.deserialize)((0, bson_1.serialize)(section.payload)));
        return Buffer.concat([kindBuffer, payloadBuffer]);
    }));
    const flagBitsBuffer = Buffer.alloc(4);
    flagBitsBuffer.writeInt32LE(message.contents.flagBits, 0);
    const headerBuffer = encodeHeader(message.header, flagBitsBuffer.length + sectionsBuffer.length);
    const buffer = Buffer.concat([headerBuffer, flagBitsBuffer, sectionsBuffer]);
    return buffer;
}
function decodeOpMsg(buffer) {
    const header = decodeHeader(buffer);
    const flagBits = buffer.readInt32LE(16);
    const sections = [];
    let offset = 20;
    while (offset < buffer.length) {
        const kind = buffer.readInt8(offset);
        offset += 1;
        const payload = (0, bson_1.deserialize)(buffer.slice(offset));
        if (kind !== 0 && kind !== 1) {
            throw new Error(`Unknown section kind: ${kind}`);
        }
        sections.push({ kind, payload });
        offset += payload.length;
    }
    return {
        header,
        contents: {
            flagBits,
            sections,
        },
    };
}
function encodeOpCompressed(message) {
    throw new Error('Not implemented');
}
function decodeOpCompressed(buffer) {
    throw new Error('Not implemented');
}
function encodeMessage(message) {
    switch (message.header.opCode) {
        case OP_QUERY:
            return encodeOpQuery(message);
        case OP_MSG:
            return encodeOpMsg(message);
        case OP_COMPRESSED:
            return encodeOpCompressed(message);
        default:
            throw new Error(`Unknown opCode: ${message.header.opCode}`);
    }
}
exports.encodeMessage = encodeMessage;
function encodeResults(config) {
    const sections = [
        {
            kind: 0,
            payload: {
                cursor: {
                    firstBatch: config.results,
                    id: 0,
                    ns: `${config.db}.${config.collection}`,
                },
                ok: 1,
            },
        },
    ];
    return encodeMessage({
        header: {
            requestID: 4050,
            responseTo: config.responseTo,
            opCode: OP_MSG,
        },
        contents: {
            flagBits: 0,
            sections,
        },
    });
}
exports.encodeResults = encodeResults;
function decodeMessage(buffer) {
    const opCode = buffer.readInt32LE(12);
    switch (opCode) {
        case OP_QUERY:
            return decodeOpQuery(buffer);
        case OP_MSG:
            return decodeOpMsg(buffer);
        case OP_COMPRESSED:
            return decodeOpCompressed(buffer);
        case OP_REPLY:
            return decodeOpReply(buffer);
        default:
            throw new Error(`Unknown opCode: ${opCode}`);
    }
}
exports.decodeMessage = decodeMessage;
function decodeOpReply(buffer) {
    const header = decodeHeader(buffer);
    return {
        header,
        contents: null,
    };
}
//# sourceMappingURL=protocol.js.map