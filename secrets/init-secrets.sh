#!/usr/bin/env bash
# ==============================================================
# init-secrets.sh – Genera los archivos de secretos para DEV
# En staging/prod: reemplazar por Docker Swarm secrets, Vault,
# AWS Secrets Manager o equivalente.
# ==============================================================
set -euo pipefail

SECRETS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colores
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# Genera una cadena aleatoria segura de N bytes en hex
gen_secret() { openssl rand -hex "${1:-32}"; }

# Crea un archivo de secreto con permisos 600
write_secret() {
  local file="$SECRETS_DIR/$1"
  local value="$2"
  if [[ -f "$file" ]]; then
    warn "Ya existe: $1 – no se sobreescribe. Borra el archivo si quieres regenerarlo."
    return
  fi
  printf '%s' "$value" > "$file"
  chmod 600 "$file"
  info "Creado: $1"
}

command -v openssl >/dev/null 2>&1 || error "openssl no encontrado. Instálalo primero."

info "Generando secretos para entorno de desarrollo..."
echo ""

write_secret "pg_password.txt"      "$(gen_secret 20)"
write_secret "redis_password.txt"   "$(gen_secret 20)"
write_secret "jwt_secret.txt"       "$(gen_secret 32)"
write_secret "qr_hmac_secret.txt"   "$(gen_secret 32)"
write_secret "pgadmin_password.txt" "$(gen_secret 16)"

echo ""
info "Secretos listos. NUNCA commitees ./secrets/ al repositorio."
warn "Asegúrate de que ./secrets/ esté en tu .gitignore."
