# maggregordb
MaggregorDB is an in-memory database that performs aggregations very quickly.

![MaggregorDB](https://github.com/estebgonza/maggregordb/actions/workflows/tests.yaml/badge.svg)

## Packages

| Packages           | Description | 
|--------------------|-------------|
| `packages/core`    | The core database package (cached aggregations) |
| `packages/mongodb-parser`  | A MongoDB aggregation query parser [ts-mongo-aggregation-parser] |
| `packages/mongodb-adapter` | Make MongoDB queries works with the core |
| `packages/mongodb-proxy` | A TCP Proxy for MongoDB that trigger the adapter   |
| `packages/server` | Expose the proxy and web interface |
| `packages/cli` | A simple CLI to start and configure the server |
