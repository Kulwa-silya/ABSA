# docker/prod/frontend/Dockerfile
FROM node:18 as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npx vite --version || echo "Vite not installed"

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production environment
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add nginx configuration for the frontend
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
