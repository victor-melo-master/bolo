# AGENTS — Módulo Financiero (Fin)

## Propósito
Billetera digital, tarifarios, tasas de cambio, transacciones y pagos.

## Estado
🔄 Parcial — 5 entidades de dominio completas, 2 casos de uso implementados, 4 pendientes.

## Entidades de dominio (5)
| Entidad | Esquema BD | Propósito |
|---------|-----------|-----------|
| `WalletEntity` | `fin.wallets` | Billetera con OCC (version), balance, debt_balance, credit_used |
| `TransactionEntity` | `fin.transactions` | Movimiento inmutable (deposit, withdrawal, etc.) |
| `CoopFareEntity` | `fin.coop_fares` | Tarifario por cooperativa, base_amount_usd en centavos, recargos |
| `ExchangeRateEntity` | `fin.exchange_rates` | Tasa diaria BCV, currency + effective_date único |
| `SagaStateEntity` | `fin.saga_states` | Estado de sagas transaccionales distribuidas |

## Value Objects
- `MoneyVO` — inmutable, centavos enteros (BIGINT), con operaciones aritméticas

## Casos de uso
### ✅ Implementados
- `CreateWalletUseCase` — crea billetera con saldo 0, controla duplicados
- `CreateCoopFareUseCase` — crea tarifario, valida exchange_rate, evita nombres duplicados

### ⏳ Pendientes (stubs)
- `DepositUseCase` — recarga de saldo
- `WithdrawUseCase` — retiro de saldo
- `ProcessPaymentUseCase` — pago de viaje (saga distribuida)
- `GetBalanceUseCase` — consulta de saldo

## Endpoints REST
| Método | Ruta | Controlador | Estado |
|--------|------|-------------|--------|
| POST | `/fin/wallets` | WalletController | ✅ |
| POST | `/fin/coop-fares` | CoopFareController | ✅ |
| GET | `/fin/wallets/:id/balance` | WalletController | ⏳ |
| POST | `/fin/wallets/:id/deposit` | TransactionController | ⏳ |
| POST | `/fin/wallets/:id/withdraw` | TransactionController | ⏳ |

## Puertos
- `WALLET_REPOSITORY_PORT` → WalletRepositoryImpl
- `COOP_FARE_REPOSITORY_PORT` → CoopFareRepositoryImpl
- `EXCHANGE_RATE_REPOSITORY_PORT` → ExchangeRateRepositoryImpl
- `TRANSACTION_REPOSITORY_PORT` → TransactionRepositoryImpl (stub)
- `SAGA_STATE_REPOSITORY_PORT` → SagaStateRepositoryImpl (stub)
- `WALLET_SERVICE_PORT` → WalletServiceImpl

## Reglas de negocio clave
- Todos los montos en **centavos** (BIGINT). 150 = $1.50. Nunca floats.
- `fin.transactions` es **inmutable** — trigger bloquea UPDATE/DELETE
- OCC en wallets: `version` se incrementa en cada UPDATE
- `debt_balance` para crédito de emergencia (hasta 2 viajes)
- Recargos/descuentos por categoría: normal (0¢), student (-50¢), elderly (-30¢)

## Tests
```bash
npx jest src/modules/fin  # 5 spec files (create-wallet, create-coop-fare, wallet-impl)
```
