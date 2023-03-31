import { MongoDBTcpProxyService } from './proxy.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

// This will create an new instance of "MongoMemoryServer" and automatically start it

// jest.setTimeout(60000);
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
    service = new MongoDBTcpProxyService().initProxy({
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
    await mongodbClient.close();
    await mongodbServer.stop();
    service.stop();
  });

  it('Simple aggregate query', async () => {
    const db = mongodbClient.db('test');
    const collection = db.collection('test');
    await collection.insertOne({ a: 1 });
    const docs = await collection.aggregate([{ $match: { a: 1 } }]).toArray();
    expect(docs.length).toBe(1);
    expect(docs[0].a).toBe(1);
  });
});
