# Docker Setup Guide

This guide explains how to run the ChatBox application in a Docker container with both backend and frontend combined.

## Prerequisites

- Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (usually included with Docker Desktop)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and run the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at **http://localhost:5000**

### Option 2: Using Docker CLI

```bash
# Build the image
docker build -t chatbox-app .

# Run the container
docker run -d \
  -p 5000:5000 \
  -v $(pwd)/backend/chatbox.db:/app/backend/chatbox.db \
  --name chatbox-app \
  chatbox-app

# View logs
docker logs -f chatbox-app

# Stop the container
docker stop chatbox-app
docker rm chatbox-app
```

## Features

- **Single Container**: Both frontend and backend run in one container
- **Multi-stage Build**: Optimized image size using Docker multi-stage builds
- **Volume Mounting**: Database persists on host machine
- **Environment Variables**: Easily configure via docker-compose.yml

## Configuration

Edit `docker-compose.yml` to customize:

```yaml
environment:
  NODE_ENV: production
  PORT: 5000
  JWT_SECRET: your-custom-secret-key
```

## Accessing the Application

Once running, access the application at:
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api

## Data Persistence

The SQLite database is stored in a volume mounted at `./backend/chatbox.db` on your host machine. This ensures data persists even when the container is stopped or removed.

## Troubleshooting

### Container exits immediately
```bash
# Check logs
docker-compose logs

# Or with Docker CLI
docker logs chatbox-app
```

### Port 5000 already in use
```bash
# Change port in docker-compose.yml
# Or kill the process using port 5000
lsof -i :5000
kill -9 <PID>
```

### Rebuild after code changes
```bash
docker-compose up --build
```

## Production Tips

1. Change `JWT_SECRET` to a strong random value
2. Set `NODE_ENV=production`
3. Use a reverse proxy (nginx) for better performance
4. Consider using a managed database instead of SQLite for scalability
