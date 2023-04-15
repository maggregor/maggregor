/// <reference types="node" />
declare const OP_REPLY = 1;
declare const OP_QUERY = 2004;
declare const OP_MSG = 2013;
declare const OP_COMPRESSED = 2012;
type MongoDBSection = {
    kind: 0 | 1;
    payload: any;
};
type MongoDBMessage = {
    header: {
        messageLength?: number;
        requestID: number;
        responseTo: number;
        opCode: number;
    };
    contents: {
        flagBits: number;
        sections: MongoDBSection[];
    };
};
declare function encodeMessage(message: MongoDBMessage): Buffer;
export type MsgResult = {
    db: string;
    collection: string;
    results: any[];
    responseTo: number;
};
declare function encodeResults(config: MsgResult): Buffer;
declare function decodeMessage(buffer: Buffer): MongoDBMessage;
export { OP_QUERY, OP_MSG, OP_COMPRESSED, OP_REPLY, encodeMessage, decodeMessage, encodeResults, };
export type { MongoDBMessage, MongoDBSection };
