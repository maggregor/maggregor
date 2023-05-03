import sizeof from 'object-sizeof';

interface CacheItem {
  result: any;
  frequency: number;
  query: string;
  collection: string;
  db: string;
}

export class InMemoryCache {
  private _maxBytesSize: number;
  private cache: Record<string, CacheItem>;

  constructor(maxSizeMb: number) {
    this._maxBytesSize = maxSizeMb * 1024 * 1024;
    this.cache = {};
  }

  has(query: string, collection: string, db: string): boolean {
    const key = `${query}-${collection}-${db}`;
    return key in this.cache;
  }

  get(query: string, collection: string, db: string): any | null {
    const key = `${query}-${collection}-${db}`;
    if (key in this.cache) {
      // Update frequency count
      this.cache[key].frequency++;
      return this.cache[key].result;
    } else {
      return null;
    }
  }

  set(query: string, collection: string, db: string, result: any): void {
    if (this._maxBytesSize <= 0) {
      // Cache is disabled
      return;
    }
    const key = `${query}-${collection}-${db}`;
    const item_size = sizeof(result);
    if (this.currentSize() + item_size > this._maxBytesSize) {
      // Sort items in cache by frequency count
      const items = Object.keys(this.cache).map((key) => this.cache[key]);
      items.sort((a, b) => a.frequency - b.frequency);
      // Evict least frequently used item
      delete this.cache[
        `${items[0].query}-${items[0].collection}-${items[0].db}`
      ];
    }
    // Add new item to cache
    this.cache[key] = {
      result,
      frequency: 1,
      query,
      collection,
      db,
    };
  }

  private currentSize(): number {
    // Calculate the current size of the cache
    let size = 0;
    for (const key in this.cache) {
      if (this.cache.hasOwnProperty(key)) {
        size += sizeof(this.cache[key].result);
      }
    }
    return size;
  }

  public invalidateAll(): void {
    this.cache = {};
  }

  public invalidateCollection(db: string, collection: string): void {
    for (const key in this.cache) {
      if (
        this.cache.hasOwnProperty(key) &&
        this.cache[key].collection === collection &&
        this.cache[key].db === db
      ) {
        delete this.cache[key];
      }
    }
  }

  public get maxSize(): number {
    return this._maxBytesSize;
  }
}
