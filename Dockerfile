# Stage 1: Build React Frontend
FROM node:18 AS builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
RUN cd frontend && npm install

# Copy frontend source
COPY frontend ./frontend/

# Build React app
RUN cd frontend && npm run build

# Stage 2: Create production image with Node.js backend
FROM node:18-slim

# Install system dependencies (minimal set)
RUN apt-get update && apt-get install -y \
    curl \
    sqlite3 \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies with prebuilt binaries
RUN cd backend && npm install --verbose 2>&1 | tail -20

# Copy backend source
COPY backend ./backend/

# Copy built React app from builder stage
COPY --from=builder /app/frontend/build ./frontend/build

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV NODE_OPTIONS="--max-old-space-size=512"

# Start the server
CMD ["node", "backend/server.js"]
