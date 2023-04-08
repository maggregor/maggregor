import { Test, TestingModule } from '@nestjs/testing';
import { RequestService } from '@server/modules/request/request.service';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Request, RequestSchema } from '@server/modules/request/request.schema';
import { Model } from 'mongoose';
import { DatabaseModule } from '@/server/modules/database/database.module';

describe('RequestService (integration)', () => {
  let service: RequestService;
  let model: Model<Request>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        MongooseModule.forFeature([
          { name: Request.name, schema: RequestSchema },
        ]),
      ],
      providers: [RequestService],
    }).compile();

    service = module.get<RequestService>(RequestService);
    model = module.get<Model<Request>>(getModelToken(Request.name));
  });

  beforeEach(async () => {
    await model.deleteMany({});
  });

  afterAll(async () => {
    await model.deleteMany({});
  });

  const expectRequest = (result: Request, request: Request) => {
    expect(result).toBeDefined();
    // @ts-ignore
    expect(result._id).toBeDefined();
    expect(result.request).toStrictEqual(request.request);
    expect(result.id).toStrictEqual(request.id);
    expect(result.startAt).toStrictEqual(request.startAt);
    expect(result.endAt).toStrictEqual(request.endAt);
    expect(result.collectionName).toStrictEqual(request.collectionName);
    expect(result.dbName).toStrictEqual(request.dbName);
  };

  describe('create', () => {
    it('should create a new request', async () => {
      const request = {
        request: 'test',
        id: 'testId',
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection',
        dbName: 'testDatabase',
      };
      const result = await service.create(request);
      expectRequest(result, request);
    });
  });

  describe('findAll', () => {
    it('should return all requests', async () => {
      const request1 = {
        request: 'test1',
        id: 'testId1',
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection1',
        dbName: 'testDatabase1',
      };
      const request2 = {
        request: 'test2',
        id: 'testId2',
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection2',
        dbName: 'testDatabase2',
      };
      await service.create(request1);
      await service.create(request2);
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
      expectRequest(result[0], request1);
      expectRequest(result[1], request2);
    });
  });

  describe('findOne', () => {
    it('should return a request by id', async () => {
      const request = {
        request: 'test',
        id: 'testId',
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection',
        dbName: 'testDatabase',
      };
      const created = await service.create(request);
      // @ts-ignore
      const result = await service.findOne({ _id: created._id });
      expectRequest(result, request);
    });
  });

  describe('update', () => {
    it('should update a request', async () => {
      const request = {
        request: 'test',
        id: 'testId',
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection',
        dbName: 'testDatabase',
      };
      const created = await service.create(request);
      // @ts-ignore
      const updated = await service.update(created._id, {
        request: 'testUpdated',
      });
      expectRequest(updated, {
        ...request,
        request: 'testUpdated',
      });
    });
  });

  describe('remove', () => {
    it('should remove a request', async () => {
      const request = {
        request: 'test',
        id: 'testId',
        startAt: new Date(),
        endAt: new Date(),
        collectionName: 'testCollection',
        dbName: 'testDatabase',
      };
      const created = await service.create(request);
      // @ts-ignore
      const removed = await service.delete(created._id);
      expectRequest(removed, request);
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result.length).toEqual(0);
    });
  });
});
