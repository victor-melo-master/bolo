// src/modules/fin/application/use-cases/get-balance.use-case.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * GetBalanceUseCase — Caso de Uso: Consultar Saldo
 * ═══════════════════════════════════════════════════════════════
 *
 * Retorna el saldo disponible, la deuda por crédito de emergencia y
 * la moneda de la billetera de un usuario.
 *
 * Flujo:
 *   1. Buscar billetera por userId
 *   2. Si no existe, retornar saldo 0 / deuda 0 / moneda por defecto
 *   3. Retornar BalanceResponseDto con los datos
 *
 * Capa: Aplicación (fin)
 *
 * @module GetBalanceUseCase
 */
