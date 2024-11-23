# syntax=docker/dockerfile:1

# Use full image because we need node-gyp to build native dependencies
FROM node:20 AS build

RUN npm install -g pnpm@8.14.1 && npm cache clean --force

WORKDIR /app

COPY package.json package-lock.* ./
ADD app/lib ./app/lib
RUN pnpm install

# Build the application
COPY . .
RUN pnpm build

# ====================================
FROM build AS release

CMD ["npm", "run", "start"]