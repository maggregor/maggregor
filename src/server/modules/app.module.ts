import { ListenerModule } from './mongodb-listener/listener.module';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RequestModule } from './request/request.module';
import { ProxyModule } from './mongodb-proxy/proxy.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { CacheModule } from './cache-request/cache.module';
import { BullModule } from '@nestjs/bullmq';
import { MaterializedViewModule } from './materialized-view/materialized-view.module';

@Module({
  imports: [
    // Setup the queue module
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    // Setup the configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PROXY_PORT: Joi.number().default(4000),
        HOST: Joi.string().default('localhost'),
        HTTP_PORT: Joi.number().default(3000),
        HTTP_HOST: Joi.string().default('localhost'),
        MONGODB_TARGET_URI: Joi.string()
          .empty('')
          .default('mongodb://localhost:27017'),
        MONGODB_METADATA_URI: Joi.string().empty('').optional(),
        CACHE_MAX_SIZE: Joi.number().default(512),
      }),
      validationOptions: {
        abortEarly: true,
      },
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    RequestModule,
    ProxyModule,
    ListenerModule,
    CacheModule,
    MaterializedViewModule,
  ],
})
export class AppModule {}
