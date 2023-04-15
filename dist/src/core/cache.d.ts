export declare class InMemoryCache {
    private max_size;
    private cache;
    constructor(max_size_mb: number);
    has(query: string, collection: string, db: string): boolean;
    get(query: string, collection: string, db: string): any | null;
    set(query: string, collection: string, db: string, result: any): void;
    private currentSize;
    invalidateAll(): void;
    invalidateCollection(collection: string, db: string): void;
}
