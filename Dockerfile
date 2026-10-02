# Node 22.16.0 / npm 10.9.2 match the Cloudflare Pages build settings
# (confirmed by the client). The repo's lockfile is package-lock.json, so
# this uses npm ci, not yarn.

FROM node:22.16.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# VITE_* vars are baked in at build time, not read at runtime — this must
# be passed as a build arg, not a plain environment variable at `docker run`.
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

FROM node:22.16.0-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY functions ./functions
COPY server ./server

EXPOSE 3000
CMD ["node", "server/index.js"]
