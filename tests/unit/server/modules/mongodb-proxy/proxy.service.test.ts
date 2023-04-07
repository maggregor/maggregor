import { MongoDBTcpProxyService } from '@server/modules/mongodb-proxy/proxy.service';
import { createProxyServiceTest } from '../../utils';

test('should be correctly configured', async () => {
  const opts = {
    env: {
      MAGGREGOR_PROXY_HOST: '127.0.0.1',
      MAGGREGOR_PROXY_PORT: 4634,
      MONGODB_HOST: 'localhost',
      MONGODB_PORT: 26424,
    },
  };
  const service = await createProxyServiceTest(opts);
  expect(service).toBeDefined();
  expect(service).toBeInstanceOf(MongoDBTcpProxyService);
  expect(service.getProxyHost()).toBe(opts.env.MAGGREGOR_PROXY_HOST);
  expect(service.getProxyPort()).toBe(opts.env.MAGGREGOR_PROXY_PORT);
  expect(service.getTargetHost()).toBe(opts.env.MONGODB_HOST);
  expect(service.getTargetPort()).toBe(opts.env.MONGODB_PORT);
});
