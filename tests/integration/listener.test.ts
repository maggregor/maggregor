import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { ListenerService } from '@/server/modules/mongodb-listener/listener.service';
import { startMongoServer, wait } from 'tests/e2e/utils';
import { createListenerService } from 'tests/unit/server/utils';

describe('ListenerService: listen changes from the MongoDB server', () => {
  let service: ListenerService;
  let mongodbClient: MongoClient;
  let mongodbServer: MongoMemoryReplSet;

  beforeAll(async () => {
    vitest.resetAllMocks();
    mongodbServer = await startMongoServer();
    service = await createListenerService({
      env: {
        MONGODB_TARGET_URI: mongodbServer.getUri(),
      },
    });
    mongodbClient = await MongoClient.connect(mongodbServer.getUri());
    await mongodbClient.db('test').createCollection('test');
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
    await wait(200); // wait for the subscription to be effective
    await collection.insertOne({ country: 'USA', city: 'New York', age: 30 });
    await collection.updateOne({ city: 'New York' }, { $set: { age: 31 } });
    await collection.deleteOne({ city: 'New York' });
    await wait(200); // wait for the change event to be emitted
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

    expect(service.isConnected()).toBe(true);
    service['client'].emit('close');
    await wait(100);
    expect(emit).toHaveBeenCalledWith('end');
    expect(loggerSpyWarn.mock.lastCall).toMatch(/connection lost/);
    await wait(3000);
    expect(emit).toHaveBeenCalledWith('connection');
    expect(loggerSpySuccess.mock.lastCall).toMatch(/connected/);
    expect(service.isConnected()).toBe(true);

    loggerSpyWarn.mockRestore();
  });

  test('should throw error when trying to subscribe to a non-existing collection', async () => {
    const callback = vitest.fn();
    await expect(
      service.subscribeToCollectionChanges('test', 'non-existing', callback),
    ).rejects.toThrow(/doesn\'t exist/);
  });

  test('should throw error when trying to execute an aggregation pipeline when the connection is lost', async () => {
    const fn = service.isConnected;
    expect(service.isConnected()).toBe(true);
    expect(
      service.executeAggregatePipeline('test', 'test', [
        {
          $match: { city: 'New York' },
        },
      ]),
    ).resolves.toBeTruthy();
    service.isConnected = vitest.fn(() => false);
    expect(
      service.executeAggregatePipeline('test', 'test', []),
    ).rejects.toThrow(/not established/);
    service.isConnected = fn;
  });

  test('should throw error when trying to execute invalid aggregation pipeline', async () => {
    expect(
      service.executeAggregatePipeline('test', 'test', [
        {
          $invalid: { city: 'New York' },
        },
      ]),
    ).rejects.toThrow(/Unrecognized pipeline stage name/);
  });

  describe('ListenerService: Automatic reconnection to MongoDB', () => {
    let service: ListenerService;
    let mongodbServer: MongoMemoryReplSet;

    beforeAll(async () => {
      service = await createListenerService({
        env: {
          MONGODB_TARGET_URI: 'mongodb://127.0.0.1:27018',
        },
      });
    });
    afterAll(async () => {
      await mongodbServer?.stop();
    });

    test('should try to reconnect until MongoDB is up', async () => {
      expect(service.isConnected()).toBe(false);
      const spyOnConnect = vitest.spyOn(service, 'emit');
      expect(spyOnConnect).not.toHaveBeenCalled();
      mongodbServer = await startMongoServer({ port: 27018 });
      await wait(2000);
      expect(spyOnConnect).toHaveBeenCalledTimes(1);
      expect(service.isConnected()).toBe(true);
    });
  });
});
