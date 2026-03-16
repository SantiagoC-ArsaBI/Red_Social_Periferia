# Build context: backend/
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npx prisma generate && npx nest build post-service
CMD ["node", "dist/post-service/src/main.js"]
