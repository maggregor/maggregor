<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/32603471/227660775-500b7b52-37f6-469c-beea-f3d0f940b4cd.png">
  <img alt="MaggregorCache light" src="https://user-images.githubusercontent.com/32603471/227661043-e747c07d-7813-432d-a866-d1e700461c80.png">
</picture>

[![MaggregorCache Build](https://img.shields.io/github/actions/workflow/status/maggregor/maggregor/tests.yaml?branch=main&label=Build)](#)

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
