# docker/prod/frontend/Dockerfile
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

RUN npx vite --version || echo "Vite not installed"

# Create the 'node' group and user
RUN addgroup -g 1000 node && \
    adduser -D -u 1000 -G node node

# Switch to 'node' user
USER node

# Change ownership to the custom user
RUN chown -R appuser:appuser /usr/share/nginx/html

# Copy source code
# COPY . .
COPY frontend/ ./

# Build the application
RUN npm run build

# Production environment
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add nginx configuration for the frontend
COPY docker/prod/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
