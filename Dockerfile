FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Start the server with HTTP transport
CMD ["node", "dist/index.js", "--transport", "http", "--port", "3000"]