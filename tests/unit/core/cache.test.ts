import { InMemoryCache } from '@core/cache';
import sizeof from 'object-sizeof';

describe('InMemoryCache', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    cache = new InMemoryCache(10); // 10 MB max size
  });

  it('should store and retrieve items from cache', () => {
    const query = 'myquery';
    const collection = 'users';
    const db = 'mydb';
    const result = [{ id: 1, name: 'John Doe' }];
    cache.set(query, collection, db, result);
    const cachedResult = cache.get(query, collection, db);
    expect(cachedResult).to.deep.equal(result);
  });

  it('should return null for non-existent items', () => {
    const query = 'myquery';
    const collection = 'users';
    const db = 'mydb';
    const cachedResult = cache.get(query, collection, db);
    expect(cachedResult).to.be.null;
  });

  it('should return true for items that exist in the cache', () => {
    const query = 'myquery';
    const collection = 'users';
    const db = 'mydb';
    const result = [{ id: 1, name: 'John Doe' }];
    expect(cache.has(query, collection, db)).to.be.false;
    cache.set(query, collection, db, result);
    expect(cache.has(query, collection, db)).to.be.true;
  });

  it('should evict least frequently used items when the cache will exceed its max size', () => {
    const collection = 'users';
    const db = 'mydb';
    const result = [{ id: 1, name: 'John Doe' }];
    const totalSize = sizeof(result) * 3;
    cache = new InMemoryCache(totalSize / 1024 / 1024); // Convert to MB
    cache.set('query1', collection, db, result);
    cache.set('query2', collection, db, result);
    cache.set('query3', collection, db, result);
    expect(cache.get('query1', collection, db)).to.not.be.null;
    expect(cache.get('query2', collection, db)).to.not.be.null;
    expect(cache.get('query3', collection, db)).to.not.be.null;
    cache.set('query4', collection, db, result);
    expect(cache.get('query1', collection, db)).to.be.null;
    // Simulate a query that is frequently used
    cache.get('query2', collection, db);
    cache.get('query3', collection, db);
    // Add a new item to the cache
    cache.set('query5', collection, db, result);
    // Query 4 should have been evicted because it was the least frequently used
    expect(cache.get('query4', collection, db)).to.be.null;
  });

  it("should invalidate all items in the cache when 'clear' is called", () => {
    const query = 'myquery';
    const collection = 'users';
    const db = 'mydb';
    const result = [{ id: 1, name: 'John Doe' }];
    cache.set(query, collection, db, result);
    cache.invalidateAll();
    expect(cache.get(query, collection, db)).to.be.null;
  });

  it("should invalidate a specific collection in the cache when 'invalidateCollection' is called", () => {
    const query = JSON.stringify([{ $match: { name: 'John Doe' } }]);
    const collection = 'users';
    const db = 'mydb';
    const result = [{ id: 1, name: 'John Doe' }];
    cache.set(query, collection, db, result);
    expect(cache.has(query, collection, db)).to.be.true;
    cache.invalidateCollection(collection, db);
    expect(cache.get(query, collection, db)).to.be.null;
  });
});
