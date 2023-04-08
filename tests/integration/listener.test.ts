import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { MongoDBListenerService } from '@/server/modules/mongodb-listener/listener.service';

describe('MongoDBListenerService: listen changes from the MongoDB server', () => {
  let service: MongoDBListenerService;
  let mongodbClient: MongoClient;
  let mongodbServer: MongoMemoryReplSet;

  beforeAll(async () => {
    mongodbServer = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    const app: TestingModule = await Test.createTestingModule({
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
    const fn = vi.spyOn(service, 'emit');
    const db = mongodbClient.db('test');
    const collection = await db.createCollection('test');
    await db.command({ collMod: 'test', recordPreImages: true });
    await collection.insertOne({ country: 'USA', city: 'New York', age: 30 });
    await collection.updateOne({ city: 'New York' }, { $set: { age: 31 } });
    expect(fn).toHaveBeenCalled();
    expect(true).toBeTruthy();
  });
});
