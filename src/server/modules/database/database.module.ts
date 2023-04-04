// database.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => {
        if (process.env.NODE_ENV === 'development') {
          const mongoServer = await MongoMemoryServer.create();
          const mongoUri = mongoServer.getUri();
          return {
            uri: mongoUri,
          };
        } else {
          return {
            uri: process.env.MONGO_URI,
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
