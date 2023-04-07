import { Test, TestingModule } from '@nestjs/testing';
import { MongoDBTcpProxyService } from '@server/modules/mongodb-proxy/proxy.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { RequestService } from '@server/modules/request/request.service';
import { ConfigService } from '@nestjs/config';

describe('MongoDBTcpProxyService: with mongodb-memory-server without interception', () => {
  let service: MongoDBTcpProxyService;
  let mongodbClient: MongoClient;
  let mongodbServer: MongoMemoryServer;

  beforeAll(async () => {
    mongodbServer = await MongoMemoryServer.create();
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        MongoDBTcpProxyService,
        {
          provide: RequestService,
          useValue: {},
        },
        {
          // TODO: Improve the way to mock the ConfigService
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'MONGODB_PORT') {
                return mongodbServer.getUri().split(':')[2].replace('/', '');
              }
            },
          },
        },
      ],
    }).compile();
    service = app.get<MongoDBTcpProxyService>(MongoDBTcpProxyService);
    service.start();
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
