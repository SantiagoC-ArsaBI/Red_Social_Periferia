# Build context: backend/
FROM node:20-bullseye-slim
WORKDIR /app

# Necesario para Prisma (libssl.so.1.1)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npm ci && npx prisma generate && npx nest build auth-service
# Nest monorepo outputs auth-service to dist/src/ (not dist/auth-service/src/)
CMD ["node", "dist/src/main.js"]
