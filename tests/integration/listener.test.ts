import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { MongoDBListenerService } from '@/server/modules/mongodb-listener/listener.service';
import { LoggerModule } from '@/server/modules/logger/logger.module';
import { startMongoServer, wait } from 'tests/e2e/utils';

describe('MongoDBListenerService: listen changes from the MongoDB server', () => {
  let service: MongoDBListenerService;
  let mongodbClient: MongoClient;
  let mongodbServer: MongoMemoryReplSet;

  beforeAll(async () => {
    mongodbServer = await startMongoServer();
    const app: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        MongoDBListenerService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'MONGODB_TARGET_URI') {
                return mongodbServer.getUri();
              }
            },
          },
        },
      ],
    }).compile();
    service = app.get<MongoDBListenerService>(MongoDBListenerService);
    mongodbClient = await MongoClient.connect(mongodbServer.getUri());
  });

  afterAll(async () => {
    await mongodbServer.stop();
    await mongodbClient.close();
  });

  test('should emit "change" event when document is inserted and updated', async () => {
    const callback = vitest.fn((change) => {
      expect(change).toHaveProperty('operationType');
      expect(change).toHaveProperty('ns');
    });
    const db = mongodbClient.db('test');
    const collection = db.collection('test');
    await service.subscribeToCollectionChanges('test', callback);
    await collection.insertOne({ country: 'USA', city: 'New York', age: 30 });
    await collection.updateOne({ city: 'New York' }, { $set: { age: 31 } });
    await collection.deleteOne({ city: 'New York' });
    await wait(10);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('should not emit "change" event when unsubscribed from collection', async () => {
    const callback = vitest.fn();
    service.on('change', callback);
    const db = mongodbClient.db('test');
    const collection = db.collection('test');
    await service.subscribeToCollectionChanges('test', () => null);
    await service.unsubscribeFromCollectionChanges('test', () => null);
    await collection.insertOne({ country: 'USA', city: 'New York', age: 30 });
    expect(callback).not.toHaveBeenCalled();
    service.off('change', callback);
  });
});
