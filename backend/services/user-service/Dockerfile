# Build context: backend/
FROM node:20-bullseye-slim
WORKDIR /app

# Necesario para Prisma (libssl.so.1.1)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npm ci && npx prisma generate && npx nest build user-service
CMD ["node", "dist/user-service/src/main.js"]
