#!/usr/bin/env sh
# ==============================================================
# docker-entrypoint.sh – Redis
# Lee la contraseña del Docker Secret e inicia redis-server
# ==============================================================
set -e

SECRET_FILE="/run/secrets/redis_password"

if [ ! -f "$SECRET_FILE" ]; then
  echo "[ERROR] Secret redis_password no encontrado en $SECRET_FILE"
  exit 1
fi

REDIS_PASSWORD="$(cat "$SECRET_FILE")"

# Arranca Redis con los argumentos recibidos y añade --requirepass
exec redis-server "$@" --requirepass "$REDIS_PASSWORD"