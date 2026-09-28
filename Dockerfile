# NODE_VERSION here is a placeholder (20 LTS) — Mariele still needs to
# confirm the exact Node version set in the Cloudflare Pages project
# settings (it's not in any repo file). Update the tag below to match once
# we have it; a mismatch can change build output subtly.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN corepack enable && yarn install --frozen-lockfile
COPY . .
# VITE_* vars are baked in at build time, not read at runtime — this must
# be passed as a build arg, not a plain environment variable at `docker run`.
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE
RUN yarn build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock* package-lock.json* ./
RUN corepack enable && yarn install --frozen-lockfile --production
COPY --from=build /app/dist ./dist
COPY functions ./functions
COPY server ./server

EXPOSE 3000
CMD ["node", "server/index.js"]
