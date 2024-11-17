# Use a compatible Node.js version
FROM node:18

# Set environment to development to ensure devDependencies are installed
ENV NODE_ENV=development

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install

# Verify that Vite is installed
RUN npx vite --version || echo "Vite not installed"

# Copy all project files
COPY . .

# Set permissions for the node user
RUN chown -R node:node /app

# Switch to node user
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
