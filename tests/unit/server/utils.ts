import { LoggerModule } from '@/server/modules/logger/logger.module';
import { MongoDBTcpProxyService } from '@/server/modules/mongodb-proxy/proxy.service';
import { RequestService } from '@/server/modules/request/request.service';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Request, RequestSchema } from '@server/modules/request/request.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '@/server/modules/cache-request/cache.service';
import { DatabaseModule } from '@/server/modules/database/database.module';
import { ListenerService } from '@/server/modules/mongodb-listener/listener.service';
import { IRequest } from '@/server/modules/request/request.interface';
import { IResponse } from '@/server/modules/mongodb-proxy/payload-resolver';
import { MaterializedViewService } from '@/server/modules/materialized-view/materialized-view.service';

export type TestConfigServiceOptions = {
  env: {
    [key: string]: string | number;
  };
  listenerServiceUseValue?: any;
};

// Proxy service with injected dependencies mocked
export async function createProxyServiceWithMockDeps(
  config: TestConfigServiceOptions,
) {
  const app: TestingModule = await Test.createTestingModule({
    imports: [LoggerModule],
    providers: [
      MongoDBTcpProxyService,
      {
        provide: RequestService,
        useValue: {},
      },
      {
        provide: ConfigService,
        useValue: {
          get: (key: string) => {
            return config.env[key];
          },
        },
      },
    ],
  }).compile();
  return app.get<MongoDBTcpProxyService>(MongoDBTcpProxyService);
}

// Requset service with injected dependencies mocked
export async function createRequestServiceWithMockDeps() {
  const app: TestingModule = await Test.createTestingModule({
    imports: [LoggerModule],
    providers: [
      RequestService,
      {
        provide: getModelToken(Request.name),
        useValue: {},
      },
      {
        provide: MaterializedViewService,
        useValue: {
          canExecute: () => false,
        },
      },
      {
        provide: MongoDBTcpProxyService,
        useValue: {},
      },
      {
        provide: ConfigService,
        useValue: {},
      },
      {
        provide: CacheService,
        useValue: {
          hasCachedResults: () => false,
          getCachedResults: () => null,
          tryCacheResults: () => null,
        },
      },
    ],
  }).compile();
  return app.get<RequestService>(RequestService);
}

// Cache service with injected dependencies mocked
export async function createCacheServiceWithMockDeps(
  config: TestConfigServiceOptions,
) {
  const app: TestingModule = await Test.createTestingModule({
    imports: [LoggerModule],
    providers: [
      CacheService,
      {
        provide: ListenerService,
        useValue: config.listenerServiceUseValue || {
          subscribeToCollectionChanges: () => null,
          unsubscribeFromCollectionChanges: () => null,
        },
      },
      {
        provide: ConfigService,
        useValue: {
          get: (key: string) => {
            return config.env[key];
          },
        },
      },
    ],
  }).compile();
  return app.get<CacheService>(CacheService);
}

// Request service with real dependencies (for integration tests)
export async function createMaggregorModule(
  config?: TestConfigServiceOptions,
): Promise<TestingModule> {
  const app: TestingModule = await Test.createTestingModule({
    imports: [
      LoggerModule,
      DatabaseModule,
      MongooseModule.forFeature([
        { name: Request.name, schema: RequestSchema },
      ]),
    ],
    providers: [
      RequestService,
      {
        provide: ConfigService,
        useValue: {
          get: (key: string) => {
            return config?.env[key] || null;
          },
        },
      },
      CacheService,
      MongoDBTcpProxyService,
      MaterializedViewService,
      {
        provide: ListenerService,
        useValue: {
          subscribeToCollectionChanges: () => null,
          unsubscribeFromCollectionChanges: () => null,
        },
      },
    ],
  }).compile();
  return app;
}

export async function createMaterializedViewService() {
  const app: TestingModule = await Test.createTestingModule({
    imports: [LoggerModule],
    providers: [
      MaterializedViewService,
      {
        provide: ConfigService,
        useValue: {},
      },
    ],
  }).compile();
  return app.get<MaterializedViewService>(MaterializedViewService);
}

// Listener service with real dependencies (for integration tests)
export async function createListenerService(config: TestConfigServiceOptions) {
  const app = await Test.createTestingModule({
    imports: [LoggerModule],
    providers: [
      ListenerService,
      {
        provide: ConfigService,
        useValue: {
          get: (key: string) => {
            return config.env[key];
          },
        },
      },
    ],
  }).compile();
  return app.get<ListenerService>(ListenerService);
}

export const createMockRequest = (overrides?: Partial<IRequest>): IRequest => {
  return {
    id: 'reqId',
    mongoRequestID: 1,
    db: 'myDb',
    collName: 'myCollection',
    startAt: new Date(),
    endAt: new Date(),
    pipeline: [],
    filter: {},
    query: {},
    key: 'myKey',
    limit: 10,
    requestSource: 'mongodb',
    type: 'find',
    ...overrides,
  };
};

export const createMockResponse = (
  overrides?: Partial<IResponse>,
): IResponse => {
  return {
    mongoRequestID: 1,
    responseTo: 0,
    data: [{ name: 'John' }],
    ...overrides,
  };
};
