import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@/server/modules/logger/logger.service';

@Injectable()
export class MongoDBListenerService extends EventEmitter {
  private client: MongoClient;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {
    super();
    this.startListen();
    this.logger.setContext('ListenerService');
  }

  private async startListen() {
    let retries = 3;
    while (retries) {
      try {
        this.client = await MongoClient.connect(
          this.configService.get('MONGODB_TARGET_URI'),
          {
            connectTimeoutMS: 1000,
            serverSelectionTimeoutMS: 1000,
          },
        );
        // Try to connect to the MongoDB instance.
        this.logger.success(
          'Successfully connected to the target MongoDB instance',
        );
        const changeStream = this.client.db('mydb').watch();
        changeStream.on('change', (change) => {
          this.logger.log(`Received change from MongoDB: ${change}`);
          this.emit('change', change);
        });
        return;
      } catch (error) {
        retries--;
        if (!retries) {
          this.logger.error(
            `Failed to connect to the target MongoDB instance: ${error.message}`,
          );
        } else {
          this.logger.warn(
            `Failed to connect: retry connecting to MongoDB in 1 second...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  }
}
