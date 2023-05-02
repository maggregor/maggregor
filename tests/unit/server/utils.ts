import { LoggerModule } from '@/server/modules/logger/logger.module';
import { MongoDBTcpProxyService } from '@/server/modules/mongodb-proxy/proxy.service';
import { RequestService } from '@/server/modules/request/request.service';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Request, RequestSchema } from '@server/modules/request/request.schema';

import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '@/server/modules/cache-request/cache.service';
import { DatabaseModule } from '@/server/modules/database/database.module';
import { RequestModule } from '@/server/modules/request/request.module';
import { CacheModule } from '@/server/modules/cache-request/cache.module';

export type TestConfigServiceOptions = {
  env: {
    [key: string]: string | number;
  };
};

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

export async function createRequestServiceTest() {
  const app: TestingModule = await Test.createTestingModule({
    imports: [
      LoggerModule,
      DatabaseModule,
      MongooseModule.forFeature([
        { name: Request.name, schema: RequestSchema },
      ]),
    ],
    providers: [RequestService, ConfigService, CacheService],
  }).compile();
  return app.get<RequestService>(RequestService);
}

export async function createCacheServiceWithMockDeps(
  config: TestConfigServiceOptions,
) {
  const app: TestingModule = await Test.createTestingModule({
    imports: [LoggerModule],
    providers: [
      CacheService,
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
