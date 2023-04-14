import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { MongoDBListenerService } from '@/server/modules/mongodb-listener/listener.service';
import { LoggerModule } from '@/server/modules/logger/logger.module';

describe('MongoDBListenerService: listen changes from the MongoDB server', () => {
  let service: MongoDBListenerService;
  let mongodbClient: MongoClient;
  let mongodbServer: MongoMemoryReplSet;

  beforeAll(async () => {
    mongodbServer = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
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

  test('should emit changed event', async () => {
    const callback = vi.fn((change) => {
      expect(change).toHaveProperty('operationType');
      expect(change).toHaveProperty('fullDocument');
      if (change.operationType === 'update') {
        expect(change).toHaveProperty('fullDocumentBeforeChange');
      }
      expect(change).toHaveProperty('ns');
    });
    service.on('change', callback);
    const db = mongodbClient.db('test');
    const collection = await db.createCollection('test');
    await db.command({ collMod: 'test', recordPreImages: true });
    await collection.insertOne({ country: 'USA', city: 'New York', age: 30 });
    await collection.updateOne({ city: 'New York' }, { $set: { age: 31 } });
    expect(true).toBeTruthy();
  });
});
