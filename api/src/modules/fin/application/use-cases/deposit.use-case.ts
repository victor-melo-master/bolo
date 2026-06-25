// src/modules/fin/application/use-cases/deposit.use-case.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * DepositUseCase — Caso de Uso: Realizar Depósito
 * ═══════════════════════════════════════════════════════════════
 *
 * Gestiona el ingreso de fondos a la billetera de un usuario.
 * Crea una transacción de tipo DEPOSIT con estado PENDING, la persiste
 * y actualiza el saldo de la billetera.
 *
 * Flujo:
 *   1. Buscar billetera por userId
 *   2. Crear transacción DEPOSIT en PENDING
 *   3. Incrementar el balance de la billetera
 *   4. Persistir transacción y billetera (misma transacción BD)
 *   5. Retornar transacción completada
 *
 * Capa: Aplicación (fin)
 *
 * @module DepositUseCase
 */
