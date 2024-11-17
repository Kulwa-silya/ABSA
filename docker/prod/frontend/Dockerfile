# # docker/prod/frontend/Dockerfile
# FROM node:18 AS builder

# WORKDIR /app

# # Copy package files
# COPY frontend/package*.json ./

# # Install dependencies
# RUN npm install

# RUN npx vite --version || echo "Vite not installed"

# # Copy source code
# COPY frontend/ ./

# RUN chown -R node:node /app

# # Build the application
# RUN npm run build

# # Production Stage
# FROM nginx:alpine

# # Create the 'node' group and user
# RUN addgroup -S node && adduser -S -G node node

# # Copy built assets from builder
# # COPY --from=builder /app/dist /usr/share/nginx/html

# # Copy nginx configuration
# COPY docker/prod/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# # Change ownership of the files to 'node'
# RUN chown -R node:node /usr/share/nginx

# # Switch to 'node' user
# USER node

# EXPOSE 80

# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM node:18

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/ ./

# Create non-root user and fix permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3000

# Run development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]