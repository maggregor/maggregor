import { TestingModule } from '@nestjs/testing';
import { MongoDBTcpProxyService } from '@server/modules/mongodb-proxy/proxy.service';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { startMongoServer } from 'tests/e2e/utils';
import { createMaggregorModule } from 'tests/unit/server/utils';
import * as SSLFixtures from '../__utils__/ssl/fixtures';
import fs from 'fs';

describe('MongoDBTcpProxyService: with mongodb-memory-server without interception', () => {
  let service: MongoDBTcpProxyService;
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
});

describe('MongoDBTcpProxyService: with SSL', () => {
  let service: MongoDBTcpProxyService;
  let mongodbClient: MongoClient;
  let mongodbServer: MongoMemoryReplSet;

  beforeAll(async () => {
    mongodbServer = await startMongoServer();
    vitest.spyOn(fs, 'readFileSync').mockImplementation((path) => {
      if (path === '/tmp/dummy.key') {
        return SSLFixtures.dummyPrivateKey;
      }
      if (path === '/tmp/dummy.cert') {
        return SSLFixtures.dummyCertificate;
      }
    });
    const app: TestingModule = await createMaggregorModule({
      env: {
        MONGODB_TARGET_URI: mongodbServer.getUri(),
        USE_SSL: 'true',
        SSL_KEY_PATH: '/tmp/dummy.key',
        SSL_CERT_PATH: '/tmp/dummy.cert',
      },
    });
    service = app.get<MongoDBTcpProxyService>(MongoDBTcpProxyService);
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
});
