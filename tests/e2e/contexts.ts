import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MaggregorProcess } from './setup-maggregor';
import { startMongoServer, loadTestData, healthCheck } from './utils';

const testAtlasUrl = process.env.TEST_ATLAS_URL;

if (!testAtlasUrl) {
  throw new Error(
    'E2E Tests cannot run on Mongo Atlas without the TEST_ATLAS_URL env variable.',
  );
}

export type CommonContext = {
  type: string;
  name: string;
  ssl?: boolean;
  maggregor?: MaggregorProcess;
  maggreUri?: string;
  maggreClient?: MongoClient;
  mongoUri?: string;
  mongoClient?: MongoClient;
};

export type RemoteContext = {
  type: 'remote';
  externalMongoUri: string;
} & CommonContext;

export type LocalContext = {
  type: 'local';
  startMongo: boolean;
  // If startMongo is false, then mongoUri must be required
  mongoUri?: string;
} & CommonContext;

export type Context = RemoteContext | LocalContext;

export const contexts: Context[] = [
  {
    type: 'remote',
    name: 'Remote on shared MongoDB Atlas v6.0.0',
    ssl: true,
    externalMongoUri: testAtlasUrl,
  } as RemoteContext,
  {
    type: 'local',
    name: 'Local on MongoMemoryServer v5.0.0',
    startMongo: true,
  } as LocalContext,
];

export async function setupContext(
  ctx: Context,
): Promise<{ maggreClient: MongoClient; mongoClient: MongoClient }> {
  let mongodb: MongoMemoryReplSet;
  if (ctx.type === 'local' && ctx.startMongo) {
    mongodb = await startMongoServer();
    ctx.mongoUri = mongodb.getUri();
  } else if (ctx.type === 'remote') {
    ctx.mongoUri = ctx.externalMongoUri;
  }
  ctx.maggregor = await new MaggregorProcess({
    targetUri: ctx.mongoUri,
    ssl: ctx.ssl,
  }).start();
  ctx.maggreUri = ctx.maggregor.getUri();
  ctx.maggreClient = await createClient(ctx.maggreUri);
  ctx.mongoClient = await createClient(ctx.mongoUri);
  await loadTestData(ctx.mongoClient, { totalDocs: 1000 });
  await loadTestData(ctx.mongoClient, {
    totalDocs: 1000,
    collection: 'col2',
  });
  await healthCheck(ctx.maggreClient, ctx.mongoClient);

  return {
    maggreClient: ctx.maggreClient,
    mongoClient: ctx.mongoClient,
  };
}

export const createClient = (uri: string) => {
  return MongoClient.connect(uri, {
    tlsAllowInvalidCertificates: true,
    directConnection: true,
    socketTimeoutMS: 1000,
    connectTimeoutMS: 1000,
  });
};
