# Secrets — Gestión de Secretos

## Descripción General

Sistema de almacenamiento local de secretos para el entorno de desarrollo de BOLO. Todos los secretos (contraseñas, tokens JWT, claves HMAC) se almacenan en archivos de texto plano dentro de `./secrets/`, protegidos con permisos `600` y excluidos del repositorio mediante `.gitignore`.

En desarrollo, estos archivos se montan como **Docker Secrets** en `/run/secrets/` dentro de cada contenedor. En producción, deben reemplazarse por un sistema de secrets más robusto: Docker Swarm Secrets, HashiCorp Vault, AWS Secrets Manager, o Azure Key Vault.

## Estructura de Archivos

```
secrets/
├── init-secrets.sh          # Script de generación de secretos
├── pg_password.txt          # Contraseña de PostgreSQL
├── redis_password.txt       # Contraseña de Redis
├── jwt_secret.txt           # Clave de firma JWT
├── qr_hmac_secret.txt       # Clave HMAC para códigos QR
└── pgadmin_password.txt     # Contraseña de pgAdmin
```

## Archivo init-secrets.sh (Script de Inicialización)

```bash
#!/usr/bin/env bash
set -euo pipefail

SECRETS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colores para output
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# Genera una cadena aleatoria segura de N bytes en hex
gen_secret() { openssl rand -hex "${1:-32}"; }

# Crea un archivo de secreto con permisos 600 (solo lectura para el owner)
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

# Verifica que openssl esté instalado
command -v openssl >/dev/null 2>&1 || error "openssl no encontrado. Instálalo primero."

info "Generando secretos para entorno de desarrollo..."

write_secret "pg_password.txt"      "$(gen_secret 20)"    # 20 bytes = 40 caracteres hex
write_secret "redis_password.txt"   "$(gen_secret 20)"
write_secret "jwt_secret.txt"       "$(gen_secret 32)"    # 32 bytes = 64 caracteres hex
write_secret "qr_hmac_secret.txt"   "$(gen_secret 32)"
write_secret "pgadmin_password.txt" "$(gen_secret 16)"    # 16 bytes = 32 caracteres hex

info "Secretos listos. NUNCA commitees ./secrets/ al repositorio."
warn "Asegúrate de que ./secrets/ esté en tu .gitignore."
```

### Funcionamiento del script

1. Verifica que `openssl` esté instalado
2. Genera valores aleatorios con `openssl rand -hex <N>`:
   - Contraseñas (pg, redis, pgadmin): 16-20 bytes (32-40 caracteres hex)
   - Claves criptográficas (JWT, HMAC): 32 bytes (64 caracteres hex)
3. Crea cada archivo con `chmod 600` (solo el owner puede leer)
4. Si un archivo ya existe, **no lo sobrescribe** (idempotente)

## Secretos Generados

| Archivo              | Tamaño       | Propósito                                    | Usado por                    |
|----------------------|--------------|----------------------------------------------|------------------------------|
| `pg_password.txt`    | 20 bytes hex | Contraseña del usuario `bolo_admin` en PostgreSQL | PostgreSQL, API           |
| `redis_password.txt` | 20 bytes hex | Contraseña de autenticación en Redis          | Redis, API, Middleware       |
| `jwt_secret.txt`     | 32 bytes hex | Clave secreta para firmar y verificar tokens JWT | API, Middleware           |
| `qr_hmac_secret.txt` | 32 bytes hex | Clave HMAC para firmar y verificar códigos QR | API, Middleware              |
| `pgadmin_password.txt` | 16 bytes hex | Contraseña de acceso a pgAdmin              | pgAdmin                      |

## Cómo se Usan en Docker Compose

```yaml
# docker-compose.yml
secrets:
  pg_password:
    file: ./secrets/pg_password.txt
  redis_password:
    file: ./secrets/redis_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  qr_hmac_secret:
    file: ./secrets/qr_hmac_secret.txt
  pgadmin_password:
    file: ./secrets/pgadmin_password.txt
```

Cada servicio monta los secrets que necesita:

```yaml
# Ejemplo: API
services:
  api:
    secrets:
      - pg_password
      - redis_password
      - jwt_secret
      - qr_hmac_secret
```

Dentro del contenedor, los archivos están disponibles en:

```
/run/secrets/pg_password
/run/secrets/redis_password
/run/secrets/jwt_secret
/run/secrets/qr_hmac_secret
/run/secrets/pgadmin_password
```

Las aplicaciones leen estos archivos usando las variables de entorno `*_FILE`:

```yaml
# Ejemplo: API lee la contraseña desde el archivo
environment:
  DB_PASSWORD_FILE: /run/secrets/pg_password
  JWT_SECRET_FILE: /run/secrets/jwt_secret
```

## Referencia en .env

El archivo `.env` **no contiene secretos**. Solo variables no sensibles como nombres de base de datos, usuarios y puertos.

```
# .env (NO contiene contraseñas)
POSTGRES_DB=bolo
POSTGRES_USER=bolo_admin
PGADMIN_EMAIL=admin@bolo.com
API_PORT=3000
MIDDLEWARE_PORT=8080
FRONTEND_PORT=5173
NODE_ENV=development
LOG_LEVEL=info
```

## Despliegue — Paso a Paso

### Inicialización por Primera Vez

```bash
# Desde la raíz del proyecto:
make init
# Equivalente a:
#   chmod +x secrets/init-secrets.sh
#   ./secrets/init-secrets.sh
#   docker compose build --parallel
```

### Regenerar un Secreto Específico

```bash
rm secrets/pg_password.txt
./secrets/init-secrets.sh    # Regenera solo el archivo faltante
docker compose up -d --force-recreate postgres api
```

## Migración a Producción

### Opción 1: Docker Swarm Secrets

```bash
# Crear secrets en Docker Swarm
echo "password-seguro" | docker secret create pg_password -
echo "otro-password" | docker secret create redis_password -

# En docker-compose.yml (producción):
secrets:
  pg_password:
    external: true
  redis_password:
    external: true
```

### Opción 2: HashiCorp Vault

Usar el plugin de Vault para Docker Secrets o un sidecar que lea de Vault y escriba en `/run/secrets/`.

### Opción 3: AWS Secrets Manager / Azure Key Vault

Integrar con el SDK correspondiente en cada servicio o usar un agente que sincronice los secrets al sistema de archivos.

## Notas de Seguridad

1. **NUNCA commitees secrets al repositorio**: La carpeta `secrets/` está en `.gitignore`, pero verifica siempre con `git status` antes de commitear.
2. **Rotación periódica**: En producción, rotar los secrets cada 90 días (o inmediatamente si hay sospecha de compromiso).
3. **Mínimo privilegio**: Cada servicio solo tiene acceso a los secrets que necesita (principio de least privilege).
4. **No en variables de entorno**: Los secrets nunca se pasan como variables de entorno (`POSTGRES_PASSWORD=...`), siempre como archivos.
5. **Permisos 600**: Los archivos de secrets solo son legibles por el propietario.
6. **Tamaño suficiente**: 20 bytes (160 bits) para contraseñas, 32 bytes (256 bits) para claves criptográficas.
7. **Idempotencia**: El script no sobrescribe secrets existentes, evitando rotaciones accidentales.
