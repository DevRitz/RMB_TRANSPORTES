# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --production --silent

# Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
