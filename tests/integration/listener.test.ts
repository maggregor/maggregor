import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { ListenerService } from '@/server/modules/mongodb-listener/listener.service';
import { startMongoServer, wait } from 'tests/e2e/utils';
import { createListenerService } from 'tests/unit/server/utils';

describe('MongoDBListenerService: listen changes from the MongoDB server', () => {
  let service: ListenerService;
  let mongodbClient: MongoClient;
  let mongodbServer: MongoMemoryReplSet;

  beforeAll(async () => {
    mongodbServer = await startMongoServer();
    service = await createListenerService({
      env: {
        MONGODB_TARGET_URI: mongodbServer.getUri(),
      },
    });
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
    await service.subscribeToCollectionChanges('test', 'test', callback);
    await collection.insertOne({ country: 'USA', city: 'New York', age: 30 });
    await collection.updateOne({ city: 'New York' }, { $set: { age: 31 } });
    await collection.deleteOne({ city: 'New York' });
    await wait(10);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('should not emit "change" event when unsubscribed from collection', async () => {
    const callback = vitest.fn();
    const db = mongodbClient.db('test');
    const collection = db.collection('test');
    await service.subscribeToCollectionChanges('test', 'test', callback);
    await service.unsubscribeFromCollectionChanges('test', 'test');
    await collection.insertOne({ country: 'USA', city: 'New York', age: 30 });
    await wait(10);
    expect(callback).not.toHaveBeenCalled();
  });

  test('should reconnect after MongoDB connection loss', async () => {
    const emit = vitest.spyOn(service, 'emit');
    const loggerSpyWarn = vitest.spyOn(service['logger'], 'warn');
    const loggerSpySuccess = vitest.spyOn(service['logger'], 'success');

    service['client'].emit('close');
    await wait(100);
    expect(emit).toHaveBeenCalledWith('end');
    expect(loggerSpyWarn.mock.lastCall).toMatch(/connection lost/);
    await wait(2000);
    expect(emit).toHaveBeenCalledWith('connection');
    expect(loggerSpySuccess.mock.lastCall).toMatch(/connected/);

    loggerSpyWarn.mockRestore();
  });
});
