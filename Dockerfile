# Multi-Stage Production Dockerfile for CloudSphere

# 1. Build Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# 2. Production Server
FROM node:20-alpine AS runner
WORKDIR /app

# Copy root and server dependencies
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --omit=dev && cd server && npm install --omit=dev

# Copy server codebase and built client assets
COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
