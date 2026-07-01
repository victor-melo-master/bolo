#!/bin/bash
set -e

if [ -z "$SEED_ADMIN_PASSWORD" ]; then
    echo "ERROR: SEED_ADMIN_PASSWORD no está definida. Saliendo sin crear admin."
    exit 0  # No interrumpe la inicialización, solo omite el seed
fi

psql -v admin_pass="$SEED_ADMIN_PASSWORD" -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-SQL
INSERT INTO auth.admins (phone, email, password_hash, full_name, role)
VALUES (
    '+584121234567',
    'admin@bolo.com',
    crypt(:'admin_pass', gen_salt('bf', 10)),
    'Super Admin BOLO',
    'super_admin'
) ON CONFLICT (phone) DO NOTHING;
SQL