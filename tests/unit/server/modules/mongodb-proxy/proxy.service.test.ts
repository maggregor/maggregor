import { MongoDBTcpProxyService } from '@server/modules/mongodb-proxy/proxy.service';
import { createProxyServiceWithMockDeps } from '../../utils';
import fs from 'fs';
import path from 'path';

beforeEach(() => {
  vi.clearAllMocks();
});

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

test('should throw an error if USE_SSL is true but SSL_KEY_PATH or SSL_CERT_PATH is not provided', async () => {
  await expect(
    createProxyServiceWithMockDeps({
      env: {
        PROXY_PORT: 4011,
        USE_SSL: 'true',
      },
    }),
  ).rejects.toThrowError('SSL key and certificate paths must be provided');
});

test('should initialize with SSL options when USE_SSL is true and SSL key and certificate paths are provided', async () => {
  const spyReadFileSync = vitest.spyOn(fs, 'readFileSync');
  const sslDir = path.resolve(__dirname, '../../../../__utils__/ssl');
  const opts = {
    env: {
      PROXY_PORT: 4010,
      USE_SSL: 'true',
      SSL_KEY_PATH: `${sslDir}/key.pem`,
      SSL_CERT_PATH: `${sslDir}/cert.pem`,
    },
  };

  const service = await createProxyServiceWithMockDeps(opts);
  expect(service).toBeDefined();
  expect(service).toBeInstanceOf(MongoDBTcpProxyService);
  expect(spyReadFileSync).toHaveBeenCalledWith(opts.env.SSL_KEY_PATH);
  expect(spyReadFileSync).toHaveBeenCalledWith(opts.env.SSL_CERT_PATH);
});
