# Build context: backend/
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npx prisma generate && npx nest build user-service
CMD ["node", "dist/user-service/src/main.js"]
