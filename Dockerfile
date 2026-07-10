# Use Node.js 22 Alpine for smaller image size
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/database.db"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create directory for SQLite database FIRST and ensure permissions are correct
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Install necessary packages for Prisma in production
RUN npm install prisma @prisma/client

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# When copying Next.js standalone files, make sure the nextjs user owns them
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files and migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/app/generated ./app/generated

# Double-check permissions on the data directory right before switching users
RUN chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

# Initialize database and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]