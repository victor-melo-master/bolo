# ==============================================================
# Middleware BOLO – Go Fiber
# Multi-stage: development (hot-reload) | production (scratch)
# ==============================================================

# ── Stage base: módulos compartidos ──────────────────────────
FROM golang:1.25-alpine AS base
WORKDIR /app
RUN apk add --no-cache git ca-certificates tzdata curl

COPY go.mod go.sum ./
RUN go mod download && go mod verify

# ── Stage development: hot-reload con Air ────────────────────
FROM base AS development
RUN go install github.com/air-verse/air@latest
COPY . .
# Asegúrate de forzar el uso del archivo montado
CMD ["air", "-c", "/app/.air.toml"]

# ── Stage build: compilación optimizada ──────────────────────
FROM base AS build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s -extldflags=-static" \
    -trimpath \
    -o /out/middleware ./cmd/main.go

# ── Stage production: imagen mínima (scratch) ────────────────
FROM scratch AS production
# Solo copiamos lo estrictamente necesario
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=build /out/middleware /middleware

# Usuario sin privilegios (UID 65534 = nobody en scratch)
USER 65534:65534

EXPOSE 8080
ENTRYPOINT ["/middleware"]
