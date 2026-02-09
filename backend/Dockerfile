# Stage 1: Build/Install dependencies
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
# Install ALL dependencies (including devDependencies if needed for build steps)
RUN npm install

COPY . .
# If you had a build step (e.g., TypeScript), you would run it here:
# RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --only=production && npm cache clean --force

# Copy source code from builder (or local context if no build step)
# Since we don't have a build step, we copy source directly. 
# If we had a build step, we would copy dist/build folder from builder stage.
COPY src ./src

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4000

CMD ["node", "src/index.js"]
