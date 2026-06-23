# ==============================================================
# API BOLO – Node.js / NestJS
# Multi-stage: development (hot-reload) | production (optimized)
# ==============================================================

# ── Stage base: dependencias comunes ─────────────────────────
FROM node:24.17-alpine AS base
WORKDIR /app

# Instala dumb-init para manejo correcto de señales PID 1 y curl para los healthchecks
RUN apk add --no-cache dumb-init curl

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

# ── Stage development ────────────────────────────────────────
FROM base AS development
ENV NODE_ENV=development

# Instalamos el CLI de Nest de forma global temporalmente en este stage
# para tener acceso al binario 'nest' si no queremos depender de rutas locales
RUN npm install -g @nestjs/cli

COPY . .
EXPOSE 3000

# Usamos 'nest start --watch' para compilar TypeScript al vuelo y levantar el servidor
CMD ["dumb-init", "nest", "start", "--watch"]

# ── Stage build ──────────────────────────────────────────────
FROM base AS build
COPY . .
RUN npm run build

# ── Stage production: solo runtime ───────────────────────────
FROM node:24.17-alpine AS production
WORKDIR /app

RUN apk add --no-cache dumb-init && \
    addgroup -S bolo && adduser -S bolo -G bolo

# Solo dependencias de producción
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist ./dist

# Corre como usuario sin privilegios
USER bolo:bolo

EXPOSE 3000
CMD ["dumb-init", "node", "dist/main.js"]
