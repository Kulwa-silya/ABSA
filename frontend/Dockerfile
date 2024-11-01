FROM node:16

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy project files
COPY . .

# Start development server
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]