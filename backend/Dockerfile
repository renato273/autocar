# Use a lightweight Node image
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY backend/package.json backend/pnpm-lock.yaml ./
COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN pnpm install --frozen-lockfile

# Build TypeScript
RUN pnpm run build

# Production image
FROM node:20-alpine
WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY backend/package.json .

# Install only production dependencies
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

EXPOSE 3000
CMD ["node", "dist/index.js"]
