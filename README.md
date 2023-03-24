
![MaggregorCache](https://user-images.githubusercontent.com/32603471/227653980-69847cd5-fcfb-46de-b7f4-a779547cc7ae.png)

![MaggregorCache](https://github.com/estebgonza/maggregordb/actions/workflows/tests.yaml/badge.svg)

## Packages

| Packages           | Description |
|--------------------|-------------|
| `packages/core`    | The core database package (cached aggregations) |
| `packages/mongodb-parser`  | A MongoDB aggregation query parser [ts-mongo-aggregation-parser](https://github.com/estebgonza/ts-mongo-aggregation-parser) |
| `packages/server` | Expose the proxy and web interface |

## Documentation

### Accumulators, Operators, Stages and Expressions

These are replicated paradigms from MongoDB and are used to evaluate an incoming aggregation pipeline from a MongoDB client.

### CachedAccumulator

`CachedAccumulator` is a class that implements logic to cache and update the result of an accumulator operation based on changes in documents.
The supported operations are: `$min`, `$max`, `$count`, `$sum`, `$avg`.

### Materialized Views

Materialized views are a way to cache the result of an aggregation pipeline. 
They use `CachedAccumulator` to compute the changed documents and update the cache.

You can check the tests to see how to use them: [materialized-view.test.ts](packages/core/tests/materialized-view.test.ts)

### Expression operators

The expression operators are used to evaluate the value of a property in a pipeline stage.
The following operator expressions are currently supported: `$add`, `$subtract`, `$multiply`, `$divide`, `$toUpper`, `$toLower`, `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$and`, `$or`, `$not`, `$concat`, `$mod`.

Here the full expression operators supported by MongoDB: [expression operators](https://www.mongodb.com/docs/manual/reference/operator/aggregation/#aggregation-pipeline-operators).
