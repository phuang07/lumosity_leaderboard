FROM node:20-alpine

WORKDIR /app

# Copy package files, Prisma config and schema (needed for postinstall)
COPY package.json package-lock.json* ./
COPY prisma.config.ts ./
COPY prisma ./prisma

# Install dependencies (postinstall runs prisma generate)
RUN npm ci

# Copy application source (excluding dev/test artifacts via .dockerignore)
COPY . .

# Build Next.js (DATABASE_URL placeholder - actual DB connection at runtime)
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_test"
ENV AUTH_SECRET="build-secret"
RUN npm run build

EXPOSE 3001

# Startup script: wait for DB, migrate, seed, then start
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start", "--", "-p", "3001"]
