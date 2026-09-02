# --- build the frontend ---
FROM node:20-alpine AS web-build
WORKDIR /app/web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci
COPY apps/web ./
RUN npm run build

# --- build the backend ---
FROM node:20-alpine AS api-build
WORKDIR /app/api
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci
COPY apps/api ./
RUN npm run build

# --- production image: just the backend + its runtime deps + the built frontend ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=api-build /app/api/dist ./dist
COPY --from=web-build /app/web/dist ./public

EXPOSE 3000
CMD ["node", "dist/main.js"]
