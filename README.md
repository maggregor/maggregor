# maggregordb
Maggregor is a MongoDB aggregation pipeline cache.

![MaggregorDB](https://github.com/estebgonza/maggregordb/actions/workflows/tests.yaml/badge.svg)

## Packages

| Packages           | Description |
|--------------------|-------------|
| `packages/core`    | The core database package (cached aggregations) |
| `packages/mongodb-parser`  | A MongoDB aggregation query parser [ts-mongo-aggregation-parser](https://github.com/estebgonza/ts-mongo-aggregation-parser) |
| `packages/mongodb-adapter` | Make MongoDB queries works with the core |
| `packages/server` | Expose the proxy and web interface |
| `packages/cli` | A simple CLI to start and configure the server |
