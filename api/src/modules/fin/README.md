# `fin/` — Módulo Financiero

Gestión de billetera digital, tarifas y transacciones. Implementa **Saga Pattern** para transacciones distribuidas.

## Entidades de dominio

- **Wallet** — Billetera digital de usuario
- **Transaction** — Movimiento financiero
- **ExchangeRate** — Tasa de cambio
- **CoopFare** — Tarifario de cooperativa
- **SagaState** — Estado de saga para transacciones distribuidas

## Value Objects

- **Money** — Valor inmutable en centavos para evitar errores de redondeo

## Casos de uso

| Caso de uso | Estado |
|-------------|--------|
| CreateWallet | ✅ Completo |
| CreateCoopFare | ✅ Completo |
| Deposit | ⏳ Pendiente |
| Withdraw | ⏳ Pendiente |
| ProcessPayment | ⏳ Pendiente |
| GetBalance | ⏳ Pendiente |

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/fin/wallets` | Crear billetera digital |
| POST | `/fin/coop-fares` | Crear tarifario de cooperativa |
