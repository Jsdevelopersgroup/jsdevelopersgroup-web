FROM node:20-alpine

WORKDIR /app

# Install wget/curl for health checks
RUN apk add --no-cache wget curl

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

COPY src/ ./src/

ENV NODE_ENV=production
ENV PORT=4000
ENV UPLOAD_DIR=/app/uploads

RUN mkdir -p /app/uploads

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:4000/health || exit 1

CMD ["node", "src/server.js"]
