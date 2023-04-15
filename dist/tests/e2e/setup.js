"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const vitest_1 = require("vitest");
const wait_port_1 = __importDefault(require("wait-port"));
const dotenv_1 = require("dotenv");
const setup_maggregor_1 = require("./setup-maggregor");
const mongodb_1 = require("mongodb");
(0, dotenv_1.config)({ path: '.env.test' });
global.__TEST_DB__ = 'mydb';
global.__TEST_COLLECTION__ = 'mycoll';
let mongodbServer;
let mg = new setup_maggregor_1.MaggregorProcess();
(0, vitest_1.beforeAll)(async () => {
    if (!process.env.MONGODB_TARGET_URI) {
        mongodbServer = await mongodb_memory_server_1.MongoMemoryReplSet.create({
            replSet: { count: 1, storageEngine: 'wiredTiger' },
        });
        process.env.MONGODB_TARGET_URI = mongodbServer.getUri();
    }
    mg.start();
    const host = 'localhost';
    const port = parseInt(process.env.PROXY_PORT || '27017');
    await (0, wait_port_1.default)({ host, port });
    const maggreUri = `mongodb://${host}:${port}`;
    const mongoUri = process.env.MONGODB_TARGET_URI;
    const maggreClient = await mongodb_1.MongoClient.connect(maggreUri);
    const mongoClient = await mongodb_1.MongoClient.connect(mongoUri);
    await loadTestData(mongoClient);
    await healthCheck(maggreClient, mongoClient);
    global.__MAGGRE_CLIENT__ = maggreClient;
    global.__MONGO_CLIENT__ = mongoClient;
    global.__MAGGRE_URI__ = maggreUri;
    global.__MONGO_URI__ = mongoUri;
});
(0, vitest_1.afterAll)(async () => {
    var _a, _b;
    await ((_a = global.__MAGGRE_CLIENT__) === null || _a === void 0 ? void 0 : _a.close());
    await ((_b = global.__MONGO_CLIENT__) === null || _b === void 0 ? void 0 : _b.close());
    await (mongodbServer === null || mongodbServer === void 0 ? void 0 : mongodbServer.stop());
    mg.stop();
});
async function loadTestData(client) {
    const db = client.db(global.__TEST_DB__);
    const collection = db.collection(global.__TEST_COLLECTION__);
    const batchSize = 1000;
    const totalDocs = 100000;
    for (let i = 0; i < totalDocs; i += batchSize) {
        const testData = [];
        for (let j = i; j < i + batchSize; j++) {
            const doc = {
                name: `User ${j}`,
                email: `user${j}@example.com`,
                age: j % 100,
                city: j % 10 === 0 ? 'New York' : 'Los Angeles',
                address: {
                    street: `123 Main St.`,
                    city: `Los Angeles`,
                    state: `CA`,
                    zip: j % 10000,
                },
            };
            if (j % 3 === 0) {
                delete doc.address;
            }
            if (j % 5 === 0) {
                delete doc.age;
            }
            testData.push(doc);
        }
        await collection.insertMany(testData);
    }
}
async function healthCheck(maggreClient, mongoClient) {
    const maggreDb = maggreClient.db(global.__TEST_DB__);
    const mongoDb = mongoClient.db(global.__TEST_DB__);
    const maggreCollections = await maggreDb.listCollections().toArray();
    const mongoCollections = await mongoDb.listCollections().toArray();
    const promises = [];
    for (let i = 0; i < maggreCollections.length; i++) {
        const maggreCollection = maggreDb.collection(maggreCollections[i].name);
        const mongoCollection = mongoDb.collection(mongoCollections[i].name);
        const maggreCountPromise = maggreCollection.countDocuments();
        const mongoCountPromise = mongoCollection.countDocuments();
        promises.push(new Promise((resolve, reject) => {
            Promise.all([maggreCountPromise, mongoCountPromise])
                .then(([maggreCount, mongoCount]) => {
                expect(maggreCount).toEqual(mongoCount);
                resolve();
            })
                .catch(reject);
        }));
    }
    await Promise.all(promises);
}
//# sourceMappingURL=setup.js.map