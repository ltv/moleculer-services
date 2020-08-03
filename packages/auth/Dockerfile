# syntax = docker/dockerfile:experimental
# ===== Builder =====
# ===================
FROM node:12.18.2-alpine AS builder

RUN apk --no-cache add \
  g++ make python git \
  && yarn global add node-gyp \
  && rm -rf /var/cache/apk/*

WORKDIR /builder/

# Cache auth's package
COPY packages/auth/package.json        packages/auth/
COPY package.json                      .
COPY yarn.lock                         .

# Cache internal modules' src
# COPY packages/core packages/core
COPY packages/types packages/types

RUN yarn --pure-lockfile
# RUN yarn --pure-lockfile workspace @ltv/auth add @ltv/moleculer-core

# Cache auth's src
COPY packages/auth packages/auth

# Build
RUN yarn workspace @ltv/auth build --node-args='--stack_size=6144 --max-old-space-size=6144' --mode production

# ===== Builder02 =====
# =====================
FROM node:12.18.2-alpine AS builder02

RUN apk --no-cache add \
  g++ make python git \
  && yarn global add node-gyp \
  && rm -rf /var/cache/apk/*

WORKDIR /builder02/
COPY --from=builder /builder/packages/auth/dist/ .
COPY yarn.lock                         .
# RUN sed -ie '/@ltv\/moleculer-core/d' package.json
RUN sed -ie '/@ltv\/types/d' package.json
RUN yarn install --pure-lockfile --production=true


# ===== auth =====
# ==================
FROM node:12.18.2-alpine AS auth

WORKDIR /app/
COPY --from=builder   /builder/packages/auth/dist/   .
COPY --from=builder02 /builder02/node_modules ./node_modules
COPY --from=builder02 /builder02/package.json package.json
