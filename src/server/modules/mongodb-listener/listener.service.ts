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
  dbName: string; // The name of the database the collection belongs to
}

/**
 * Service class that allows subscribing to changes on MongoDB collections
 */
@Injectable()
export class ListenerService extends EventEmitter {
  private client: MongoClient;
  private _isConnected = false;
  private changeStreams = new Map<string, CollectionChangeListener>();
  private url: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext('MongoDBListenerService');
    this.url = this.configService.get<string>('MONGODB_TARGET_URI');
    this.connectToMongoDB(); // Connect to the MongoDB instance
  }

  /**
   * Connects to the MongoDB instance specified in the configuration file.
   * The method will keep retrying the connection indefinitely until successful.
   * @private
   */
  private async connectToMongoDB() {
    while (true) {
      try {
        // Attempt to connect to the MongoDB instance
        this.client = await MongoClient.connect(this.url, {
          connectTimeoutMS: 1000,
          serverSelectionTimeoutMS: 1000,
        });
        this._isConnected = true;

        // Listen for the 'close' event on the MongoClient instance
        this.client.on('close', () => {
          this.logger.warn('MongoDB connection lost');
          this.emit('end');
          this.connectToMongoDB();
        });

        this.logger.success('Successfully connected to MongoDB instance');
        this.emit('connection');
        return;
      } catch (error) {
        this.logger.warn(
          `Failed to connect: retrying to connect to MongoDB in 1 second... Error: ${error.message}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Subscribe to changes on a MongoDB collection
   * @param collectionName The name of the MongoDB collection to listen to
   * @param callback The callback function to call when a change is detected on the collection
   */
  public async subscribeToCollectionChanges(
    dbName: string,
    collectionName: string,
    callback: (change: any) => void,
  ) {
    // Check if a CollectionChangeListener object already exists for this collection
    let collectionChangeListener = this.changeStreams.get(collectionName);
    if (!collectionChangeListener) {
      // Create a new CollectionChangeListener object for this collection
      const db = this.client.db(dbName);
      const collection: Collection = db.collection(collectionName);
      const stream: ChangeStream = collection.watch();
      const listeners: Set<(change: any) => void> = new Set();
      collectionChangeListener = { stream, listeners, dbName };
      const key = `${db.databaseName}.${collectionName}`;
      this.changeStreams.set(key, collectionChangeListener);
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
    dbName: string,
    collectionName: string,
  ) {
    const key = `${dbName}.${collectionName}`;
    const collectionChangeListener = this.changeStreams.get(key);

    if (collectionChangeListener) {
      collectionChangeListener.stream.close();
      this.changeStreams.delete(key);
    }
  }

  /**
   * Check if the connection to MongoDB is established.
   * @returns A boolean representing the connection status.
   */
  public isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Execute an aggregation pipeline on a given database and collection.
   * @param dbName The name of the MongoDB database.
   * @param collectionName The name of the MongoDB collection.
   * @param pipeline The aggregation pipeline to execute.
   * @returns An array of documents returned by the aggregation pipeline.
   */
  public async executeAggregatePipeline(
    dbName: string,
    collectionName: string,
    pipeline: any[],
  ): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB connection is not established');
    }

    const db = this.client.db(dbName);
    const collection = db.collection(collectionName);

    try {
      const results = await collection.aggregate(pipeline).toArray();
      return results;
    } catch (error) {
      this.logger.error(
        `Error executing aggregate pipeline on ${collectionName}: ${error.message}`,
      );
      throw error;
    }
  }
}
