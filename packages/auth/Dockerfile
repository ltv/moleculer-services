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
ADD packages/auth/package.json    packages/auth/
ADD package.json                      .
ADD yarn.lock                         .

# Cache internal modules' src
ADD packages/core packages/core
ADD packages/types packages/types

RUN yarn --pure-lockfile

# Cache auth's src
ADD packages/auth packages/auth

# Build
RUN yarn workspace @app/auth build --node-args='--stack_size=6144 --max-old-space-size=6144' --mode production

# ===== Builder02 =====
# =====================
FROM node:12.18.2-alpine AS builder02

RUN apk --no-cache add \
  g++ make python git \
  && yarn global add node-gyp \
  && rm -rf /var/cache/apk/*

WORKDIR /builder02/
COPY --from=builder /builder/packages/auth/dist/ .
RUN sed -ie '/@app\/core/d' ./package.json
RUN sed -ie '/@app\/types/d' ./package.json
ADD yarn.lock                         .
RUN yarn install --pure-lockfile --production=true


# ===== auth =====
# ==================
FROM node:12.18.2-alpine AS auth

WORKDIR /app/
COPY --from=builder   /builder/packages/auth/dist/   .
COPY --from=builder02 /builder02/node_modules ./node_modules
COPY --from=builder02 /builder02/package.json ./node_modules/package.json
