// src/modules/fin/application/use-cases/process-payment.use-case.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * ProcessPaymentUseCase — Caso de Uso: Procesar Pago
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta el flujo completo de un pago usando el patrón Saga:
 *   1. Auth hold: reserva el monto en la billetera
 *   2. Debit wallet: descuenta el saldo
 *   3. Record transaction: persiste la transacción PAYMENT
 *   4. Notify user: envía notificación (opcional)
 *   5. Release hold: libera la reserva
 *
 * Si algún paso falla, ejecuta compensaciones automáticas (rollback).
 *
 * Capa: Aplicación (fin)
 *
 * @module ProcessPaymentUseCase
 */
