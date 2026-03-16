# Build context: backend/
FROM node:20-bullseye-slim
WORKDIR /app

# Necesario para Prisma (libssl.so.1.1)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npm ci && npx prisma generate
RUN npx tsc -p services/seeder-service/tsconfig.json
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node services/seeder-service/dist/run-seed.js"]
