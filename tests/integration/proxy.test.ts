import { TestingModule } from '@nestjs/testing';
import { MongoDBTcpProxyService } from '@server/modules/mongodb-proxy/proxy.service';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { startMongoServer, wait } from 'tests/e2e/utils';
import { createMaggregorModule } from 'tests/unit/server/utils';
import { LoggerService } from '@/server/modules/logger/logger.service';

describe('MongoDBTcpProxyService: with mongodb-memory-server without interception', () => {
  let service: MongoDBTcpProxyService;
  let loggerService: LoggerService;
  let mongodbClient: MongoClient;
  let mongodbServer: MongoMemoryReplSet;

  beforeAll(async () => {
    mongodbServer = await startMongoServer();
    const app: TestingModule = await createMaggregorModule({
      env: {
        MONGODB_TARGET_URI: mongodbServer.getUri(),
      },
    });
    service = app.get<MongoDBTcpProxyService>(MongoDBTcpProxyService);
    loggerService = await app.resolve<LoggerService>(LoggerService);
    mongodbClient = await MongoClient.connect(
      `mongodb://${service.getProxyHost()}:${service.getProxyPort()}/`,
    );
  });

  afterAll(async () => {
    await mongodbServer.stop();
    service.stop();
    await mongodbClient.close();
  });

  test('Simple aggregate query with group', async () => {
    const db = mongodbClient.db('test');
    const collection = db.collection('test');
    await collection.insertOne({ country: 'USA', city: 'New York', age: 30 });
    await collection.insertOne({ country: 'USA', city: 'Los Angeles', age: 1 });
    await collection.insertOne({ country: 'USA', city: 'Los Angeles', age: 3 });
    await collection.insertOne({ country: 'USA', city: 'Los Angeles', age: 2 });
    await collection.insertOne({ country: 'USA', city: 'Chicago', age: 4 });
    const docs = await collection
      .aggregate([{ $group: { _id: '$country', sumAge: { $sum: '$age' } } }])
      .toArray();
    expect(docs.length).toBe(1);
    expect(docs[0]._id).toBe('USA');
    expect(docs[0].sumAge).toBe(40);
  });

  test('Do not log error when a client disconnects', async () => {
    vitest.spyOn(console, 'log').mockImplementation(() => null);
    vitest.spyOn(console, 'error').mockImplementation(() => null);

    service.handleError(new Error('ECONNRESET'));
    expect((console.error as any).mock.calls.length).toBe(0);
    service.handleError(new Error('An error occurred'));
    expect((console.error as any).mock.calls.length).toBe(1);

    vitest.restoreAllMocks();
  });
});
