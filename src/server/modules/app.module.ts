import { ListenerModule } from './mongodb-listener/listener.module';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RequestModule } from './request/request.module';
import { ProxyModule } from './mongodb-proxy/proxy.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
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
      }),
      validationOptions: {
        abortEarly: true,
      },
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.prod'
          : process.env.NODE_ENV === 'test'
          ? '.env.test'
          : '.env',
    }),
    DatabaseModule,
    RequestModule,
    ProxyModule,
    ListenerModule,
  ],
})
export class AppModule {}
