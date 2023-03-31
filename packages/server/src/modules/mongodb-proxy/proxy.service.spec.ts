import { Test, TestingModule } from '@nestjs/testing';
import { MongoDBTcpProxyService } from './proxy.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { RequestService } from '../request/request.service';
import { describe, expect, beforeAll, afterAll, test } from 'vitest';
// This will create an new instance of "MongoMemoryServer" and automatically start it

describe('TcpProxyService', () => {
  let service: MongoDBTcpProxyService;
  let mongodbClient: MongoClient;
  let mongodbServer: MongoMemoryServer;

  beforeAll(async () => {
    mongodbServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
      },
    });
    const app: TestingModule = await Test.createTestingModule({
      providers: [RequestService, MongoDBTcpProxyService],
    }).compile();
    service = app.get<MongoDBTcpProxyService>(MongoDBTcpProxyService);
    service.initProxy({
      targetHost: '127.0.0.1',
      targetPort: 27017,
      listenPort: 4000,
    });
    service.start();
    mongodbClient = await MongoClient.connect(
      `mongodb://127.0.0.1:${service.getListenPort()}`,
    );
  });

  afterAll(async () => {
    await mongodbServer?.stop();
    await mongodbClient?.close();
    service.stop();
  });

  // test('Simple aggregate query', async () => {
  //   const db = mongodbClient.db('test');
  //   const collection = db.collection('test');
  //   await collection.insertOne({ a: 1 });
  //   const docs = await collection.aggregate([{ $match: { a: 1 } }]).toArray();
  //   expect(docs.length).toBe(1);
  //   expect(docs[0].a).toBe(1);
  // });

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
    expect(docs[0].a).toBe(1);
  });
});
