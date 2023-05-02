import { Collection, MongoClient, ChangeStream } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@/server/modules/logger/logger.service';
import EventEmitter from 'events';

/**
 * Interface describing objects that represent a change stream for a MongoDB collection
 */
interface CollectionChangeListener {
  stream: ChangeStream; // The ChangeStream object listening for changes on the collection
  listeners: Set<(change: any) => void>; // The listeners for changes on the collection
}

/**
 * Service class that allows subscribing to changes on MongoDB collections
 */
@Injectable()
export class MongoDBListenerService extends EventEmitter {
  private client: MongoClient;
  private changeStreams = new Map<string, CollectionChangeListener>(); // Map of CollectionChangeListener objects

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext('MongoDBListenerService');
    this.connectToMongoDB(); // Connect to the MongoDB instance
  }

  /**
   * Connect to the MongoDB instance specified in the configuration file
   */
  private async connectToMongoDB() {
    let retries = 3;
    while (retries) {
      try {
        // Attempt to connect to the MongoDB instance
        this.client = await MongoClient.connect(
          this.configService.get('MONGODB_TARGET_URI'),
          {
            connectTimeoutMS: 1000,
            serverSelectionTimeoutMS: 1000,
          },
        );
        this.logger.success('Successfully connected to MongoDB instance');
        return;
      } catch (error) {
        retries--;
        if (!retries) {
          this.logger.error(
            `Failed to connect to MongoDB instance: ${error.message}`,
          );
        } else {
          this.logger.warn(
            'Failed to connect: retrying to connect to MongoDB in 1 second...',
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  }

  /**
   * Subscribe to changes on a MongoDB collection
   * @param collectionName The name of the MongoDB collection to listen to
   * @param callback The callback function to call when a change is detected on the collection
   */
  public async subscribeToCollectionChanges(
    collectionName: string,
    callback: (change: any) => void,
  ) {
    // Check if a CollectionChangeListener object already exists for this collection
    let collectionChangeListener = this.changeStreams.get(collectionName);
    if (!collectionChangeListener) {
      // Create a new CollectionChangeListener object for this collection
      const db = this.client.db();
      const collection: Collection = db.collection(collectionName);
      const stream: ChangeStream = collection.watch();
      const listeners: Set<(change: any) => void> = new Set();
      collectionChangeListener = { stream, listeners };
      this.changeStreams.set(collectionName, collectionChangeListener);
    }
    // Add the callback to the listeners set for the collection
    collectionChangeListener.listeners.add(callback);
    // Register the listener for changes on the collection
    collectionChangeListener.stream.on('change', (change) => {
      collectionChangeListener.listeners.forEach((listener) =>
        listener(change),
      );
    });
  }

  /**
   * Unsubscribe from changes on a MongoDB collection
   * @param collectionName The name of the MongoDB collection to stop listening to
   * @param callback The callback function to remove from the listeners list for the collection
   */
  public async unsubscribeFromCollectionChanges(
    collectionName: string,
    callback: (change: any) => void,
  ) {
    const collectionChangeListener = this.changeStreams.get(collectionName);
    collectionChangeListener.listeners.delete(callback);
    if (collectionChangeListener.listeners.size === 0) {
      collectionChangeListener.stream.close();
      this.changeStreams.delete(collectionName);
    }
  }
}
