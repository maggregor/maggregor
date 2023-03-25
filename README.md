
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/32603471/227660775-500b7b52-37f6-469c-beea-f3d0f940b4cd.png">
  <img alt="MaggregorCache light" src="https://user-images.githubusercontent.com/32603471/227661043-e747c07d-7813-432d-a866-d1e700461c80.png">
</picture>

[![MaggregorCache Tests](https://github.com/estebgonza/maggregordb/actions/workflows/tests.yaml/badge.svg)](#)
## Packages

| Packages           | Description |
|--------------------|-------------|
| `packages/core`    | The core database package (cached aggregations) |
| `packages/mongodb-parser`  | A MongoDB aggregation query parser [ts-mongo-aggregation-parser](https://github.com/estebgonza/ts-mongo-aggregation-parser) |
| `packages/server` | Expose the proxy and web interface |

## Documentation

### Operators, Stages and Expressions

These are replicated paradigms from MongoDB and are used to evaluate an incoming aggregation pipeline from a MongoDB client.

### BasicAccumulator

`BasicAccumulator` implements basic logic for an accumulator operation.
The supported operations are: `$min`, `$max`, `$count`, `$sum`, `$avg`.

### CachedAccumulator

`CachedAccumulator` implements logic to cache and update the result of an accumulator operation based on changes in documents.
The supported operations are: `$min`, `$max`, `$count`, `$sum`, `$avg`.
In Maggregor they are a part of MaterializedViews, they are used to keep up to date the result of an classic accumulator operation.

### Materialized Views

Materialized views are a way to cache the result of an aggregation pipeline. 
They use `CachedAccumulator` to compute the changed documents and update the cache.

You can check the tests to see how to use them: [materialized-view.test.ts](packages/core/tests/materialized-view.test.ts)

### Expression operators

The expression operators are used to evaluate the value of a property in a pipeline stage.
The following operator expressions are currently supported: `$add`, `$subtract`, `$multiply`, `$divide`, `$toUpper`, `$toLower`, `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$and`, `$or`, `$not`, `$concat`, `$mod`.

Here the full expression operators supported by MongoDB: [expression operators](https://www.mongodb.com/docs/manual/reference/operator/aggregation/#aggregation-pipeline-operators).
