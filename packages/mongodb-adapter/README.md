# MaggregorDB Adapter

This package provides a MongoDB adapter for MaggregorDB.

## Exported functions

### `findAvailableAggregation`

```typescript
findAvailableAggregation = (
  query: string,
  store: AggregationStore
): Aggregation | undefined
```

Finds an aggregation in the store that matches the query.

### `findResults`

```typescript
findResults = (
  query: string,
  store: AggregationStore
): AggregationResults | undefined
```

Finds the results of an aggregation in the store that matches the query.

## Example for retrieving results

```typescript
  const query = `[{$group:{_id:"$name", total: { $sum: "score"}}}]`;
  const group = new Group("$name", { type: "sum", field: "score" });
  group.init([
    { name: "John", score: 10 },
    { name: "John", score: 20 },
    { name: "Jane", score: 30 },
  ]);
  const store = new AggregationStore({
    aggregations: [group],
  });
  const results = findResults(query, store)
    // results = [{ _id: "John", total: 30 }, { _id: "Jane", total: 30 }]
```
