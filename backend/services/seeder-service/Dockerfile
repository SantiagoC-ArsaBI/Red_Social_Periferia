# Build context: backend/
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npx prisma generate
RUN npx tsc -p services/seeder-service/tsconfig.json
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node services/seeder-service/dist/run-seed.js"]
