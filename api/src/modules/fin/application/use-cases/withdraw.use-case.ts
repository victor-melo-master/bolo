// src/modules/fin/application/use-cases/withdraw.use-case.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * WithdrawUseCase — Caso de Uso: Realizar Retiro
 * ═══════════════════════════════════════════════════════════════
 *
 * Gestiona la extracción de fondos desde la billetera de un usuario.
 * Valida que exista saldo suficiente (incluyendo crédito de emergencia)
 * antes de ejecutar la operación.
 *
 * Flujo:
 *   1. Buscar billetera por userId
 *   2. Validar saldo suficiente (balance + crédito disponible)
 *   3. Crear transacción WITHDRAWAL en PENDING
 *   4. Decrementar el balance de la billetera
 *   5. Persistir transacción y billetera
 *   6. Retornar transacción completada
 *
 * Capa: Aplicación (fin)
 *
 * @module WithdrawUseCase
 */
