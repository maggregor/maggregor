import { MongoDBTcpProxyService } from '@/server/modules/mongodb-proxy/proxy.service';
import { RequestService } from '@/server/modules/request/request.service';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

export type TestServiceProxyOptions = {
  env: {
    [key: string]: string | number;
  };
};

export async function createProxyServiceTest(opts: TestServiceProxyOptions) {
  const app: TestingModule = await Test.createTestingModule({
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
