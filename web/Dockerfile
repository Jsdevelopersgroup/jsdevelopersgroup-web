FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget curl

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

COPY public/ ./public/
COPY src/ ./src/

ENV NODE_ENV=production
ENV PORT=3000
ENV API_BASE_URL=http://api-service:4000
ENV UPLOAD_DIR=/app/uploads

RUN mkdir -p /app/uploads

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
