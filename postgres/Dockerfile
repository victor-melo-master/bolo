# ==============================================================
# PostgreSQL 18 + PostGIS
# UUID v7 nativo (no requiere función personalizada)
# ==============================================================
FROM postgres:18

LABEL maintainer="BOLO Dev Team"
LABEL description="PostgreSQL 18 with PostGIS for BOLO MVP"

# Instala PostGIS en una sola capa y limpia cache
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        postgresql-18-postgis-3 \
        postgresql-18-postgis-3-scripts \
    && rm -rf /var/lib/apt/lists/*

# Copia configuración de autenticación endurecida
COPY pg_hba.conf /etc/postgresql/pg_hba.conf

RUN ldconfig
