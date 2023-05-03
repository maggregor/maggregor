import { MongoDBTcpProxyService } from '@server/modules/mongodb-proxy/proxy.service';
import { createProxyServiceWithMockDeps } from '../../utils';

test('should be correctly configured', async () => {
  const opts = {
    env: {
      HOST: '127.0.0.1',
      PROXY_PORT: 4634,
      MONGODB_TARGET_URI: 'mongodb://localhost:27017',
    },
  };
  const service = await createProxyServiceWithMockDeps(opts);
  expect(service).toBeDefined();
  expect(service).toBeInstanceOf(MongoDBTcpProxyService);
  expect(service.getProxyHost()).toBe(opts.env.HOST);
  expect(service.getProxyPort()).toBe(opts.env.PROXY_PORT);
  expect(service.getTargetHost()).toBe('localhost');
  expect(service.getTargetPort()).toBe(27017);
});

test('should throw an error if MONGODB_TARGET_URI is invalid', async () => {
  await expect(
    createProxyServiceWithMockDeps({
      env: {
        MONGODB_TARGET_URI: 'mongodcalhost',
      },
    }),
  ).rejects.toThrowError();
});

test('should works with complex MONGODB_TARGET_URI', async () => {
  const opts = {
    env: {
      MONGODB_TARGET_URI:
        'mongodb+srv://username:password@localhost/name?a=b&c=d',
    },
  };
  const service = await createProxyServiceWithMockDeps(opts);
  expect(service).toBeDefined();
  expect(service).toBeInstanceOf(MongoDBTcpProxyService);
  expect(service.getTargetHost()).toBe('localhost');
  expect(service.getTargetPort()).toBe(27017);
});
