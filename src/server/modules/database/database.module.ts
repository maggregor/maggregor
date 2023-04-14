import { ConfigService } from '@nestjs/config';
// database.module.ts
import { Inject, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const mongodbUri = config.get<string>('MONGODB_METADATA_URI');
        if (!mongodbUri) {
          const mongoServer = await MongoMemoryServer.create();
          const mongoUri = mongoServer.getUri();
          return {
            uri: mongoUri,
          };
        } else {
          return {
            uri: mongodbUri,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
          };
        }
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
