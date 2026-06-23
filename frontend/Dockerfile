# ==============================================================
# Frontend BOLO – React + Vite
# Multi-stage: development (HMR) | production (nginx)
# ==============================================================

# ── Stage development: HMR activo ───────────────────────────
FROM node:24.17-alpine AS development
WORKDIR /app

RUN apk add --no-cache dumb-init curl

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

COPY . .
EXPOSE 5173
# host 0.0.0.0 necesario para que Vite sea accesible desde fuera del contenedor
CMD ["dumb-init", "npx", "vite", "--host", "0.0.0.0", "--port", "5173"]

# ── Stage build ──────────────────────────────────────────────
FROM node:24.17-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

COPY . .
RUN npm run build

# ── Stage production: nginx mínimo ──────────────────────────
FROM nginx:1.27-alpine AS production

# Copia build y config nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Usuario sin privilegios
RUN addgroup -S bolo && adduser -S bolo -G bolo && \
    chown -R bolo:bolo /usr/share/nginx/html /var/cache/nginx /var/log/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
