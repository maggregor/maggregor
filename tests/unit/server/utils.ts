import { LoggerModule } from '@/server/modules/logger/logger.module';
import { MongoDBTcpProxyService } from '@/server/modules/mongodb-proxy/proxy.service';
import { RequestService } from '@/server/modules/request/request.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Request } from '@server/modules/request/request.schema';

import { Test, TestingModule } from '@nestjs/testing';

export type TestServiceProxyOptions = {
  env: {
    [key: string]: string | number;
  };
};

export async function createProxyServiceTest(opts: TestServiceProxyOptions) {
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
            return opts.env[key];
          },
        },
      },
    ],
  }).compile();
  return app.get<MongoDBTcpProxyService>(MongoDBTcpProxyService);
}

export async function createRequestServiceTest() {
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
    ],
  }).compile();
  return app.get<RequestService>(RequestService);
}
