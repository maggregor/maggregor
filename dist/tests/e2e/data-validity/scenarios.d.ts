import type { MongoClient } from 'mongodb';
declare const _default: {
    toString: () => string;
    name: string;
    request: (client: MongoClient) => Promise<import("bson").Document[]>;
}[];
export default _default;
