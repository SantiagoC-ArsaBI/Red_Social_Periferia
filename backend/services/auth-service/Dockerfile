# Build context: backend/
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npx prisma generate && npx nest build auth-service
CMD ["node", "dist/auth-service/src/main.js"]
