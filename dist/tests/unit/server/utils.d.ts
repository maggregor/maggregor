import { MongoDBTcpProxyService } from '@/server/modules/mongodb-proxy/proxy.service';
export type TestServiceProxyOptions = {
    env: {
        [key: string]: string | number;
    };
};
export declare function createProxyServiceTest(opts: TestServiceProxyOptions): Promise<MongoDBTcpProxyService>;
