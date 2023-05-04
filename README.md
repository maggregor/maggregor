<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/32603471/236143338-f48aa292-1964-443a-9bb6-0bfdc5ca09d7.png">
  <img alt="MaggregorCache light" src="https://user-images.githubusercontent.com/32603471/236143424-580d21c2-2214-4548-98cf-2008e3622d3a.png">
</picture>

<div align="center">

[![Maggregor Build](https://img.shields.io/github/actions/workflow/status/maggregor/maggregor/tests.yaml?branch=main&label=Build)](#)
[![Maggregor Code Coverage](https://codecov.io/gh/maggregor/maggregor/branch/main/graph/badge.svg?token=etcX0aJ1Er)](https://codecov.io/gh/maggregor/maggregor)

</div>

# Architecture
[![Maggregor Architecture](https://user-images.githubusercontent.com/32603471/236058294-6f0525bd-cb84-4178-a2c6-cc87d742b0e8.png)](#)

# Quick start

## Docker-compose

### Prerequisites

Before you begin, make sure you have the following software installed on your machine:

- [Docker](https://docs.docker.com/get-docker/): Install Docker on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/): Install Docker Compose on your machine.

### Getting Started

To get started, follow these steps:

- Clone the repository containing the docker-compose.yml file to your local machine.
- Navigate to the directory where the docker-compose.yml file is located.
- Open a terminal or command prompt in that directory.
- Run the following command to start the Docker containers:

```bash
docker-compose up
```

### Configuration

The docker-compose.yml file defines three services: mongodb-target, mongodb-metadata, and maggregor. Each service is configured with its own settings, such as image name, container name, ports, and environment variables.

| Environment Variable | Description                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| PROXY_PORT           | The port number on which the maggregor server will listen for incoming proxy requests to MongoDB. |
| HTTP_PORT            | The port number on which the maggregor server will listen for HTTP requests for API and UI.       |
| MONGODB_TARGET_URI   | The URI of the target MongoDB server to which the requests will be forwarded.                     |
| MONGODB_METADATA_URI | The URI of the MongoDB server where metadata used by maggregor will be used (optional).           |

You can configure the application by modifying the docker-compose.yml file according to your requirements. For example, you can change the port mappings or update the environment variables to connect to your own MongoDB instances.

# Directory Structure

| Directory | Description                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------  |
| `src/core`   | The core database package (cached aggregations)                                                            |
| `src/parser` | A MongoDB aggregation query parser                                                                         |
| `src/server` | Proxy the MongoDB Wire Protocol and intercepts Aggregation Pipeline queries                                |
