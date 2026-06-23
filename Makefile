# ==============================================================
# Makefile – BOLO MVP
# Uso: make <target>
# ==============================================================

COMPOSE      = docker compose
COMPOSE_TOOLS = $(COMPOSE) --profile tools

.PHONY: help init up down restart logs ps shell-api shell-db tools clean nuke

# ── Ayuda ────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  BOLO MVP – Comandos disponibles"
	@echo "  ─────────────────────────────────────────────"
	@echo "  make init        Genera secretos e inicia el stack"
	@echo "  make up          Levanta todos los servicios"
	@echo "  make down        Detiene los servicios (conserva datos)"
	@echo "  make restart     Reinicia todos los servicios"
	@echo "  make logs        Sigue los logs de todos los servicios"
	@echo "  make ps          Estado de los contenedores"
	@echo "  make shell-api   Shell interactiva en el contenedor API"
	@echo "  make shell-db    psql directo en PostgreSQL"
	@echo "  make tools       Levanta stack + pgAdmin"
	@echo "  make clean       Borra contenedores e imágenes (conserva volúmenes)"
	@echo "  make nuke        ⚠️  Borra TODO incluidos volúmenes"
	@echo ""

# ── Inicialización ───────────────────────────────────────────
init:
	@chmod +x secrets/init-secrets.sh
	@./secrets/init-secrets.sh
	@$(COMPOSE) build --parallel
	@echo ""
	@echo "✅  Stack listo. Ejecuta 'make up' para arrancar."

# ── Ciclo de vida ────────────────────────────────────────────
up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f --tail=100

ps:
	$(COMPOSE) ps

# ── Herramientas ─────────────────────────────────────────────
tools:
	$(COMPOSE_TOOLS) up -d

# ── Shells de debug ──────────────────────────────────────────
shell-api:
	$(COMPOSE) exec api sh

shell-db:
	$(COMPOSE) exec postgres psql -U $${POSTGRES_USER:-bolo_admin} -d $${POSTGRES_DB:-bolo}

# ── Limpieza ─────────────────────────────────────────────────
clean:
	$(COMPOSE) down --rmi local --remove-orphans

nuke:
	@echo "⚠️  Esto borrará TODOS los volúmenes y datos. Presiona Ctrl+C para cancelar..."
	@sleep 5
	$(COMPOSE) down -v --rmi local --remove-orphans
