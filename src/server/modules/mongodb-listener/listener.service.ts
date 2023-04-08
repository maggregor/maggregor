import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MongoDBListenerService extends EventEmitter {
  private client: MongoClient;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super();
    this.startListen();
  }

  private async startListen() {
    this.client = await MongoClient.connect(
      this.configService.get('MONGODB_TARGET_URI'),
    );
    const db = this.client.db();
    db.watch([], {
      fullDocument: 'updateLookup',
      fullDocumentBeforeChange: 'required',
    }).on('change', (change) => {
      this.emit('change', change);
    });
  }
}
