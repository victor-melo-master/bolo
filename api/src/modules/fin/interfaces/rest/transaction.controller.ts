// src/modules/fin/interfaces/rest/transaction.controller.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * TransactionController — Controlador REST de Transacciones
 * ═══════════════════════════════════════════════════════════════
 *
 * Expone endpoints para operaciones financieras (depósitos, retiros,
 * pagos, transferencias). Ruta base: /fin/transactions
 *
 * Capa: Interfaces (fin/rest)
 *
 * @module TransactionController
 */

import { Controller } from '@nestjs/common';

@Controller('fin/transactions')
export class TransactionController {
  // ─── Pendiente de implementar ───
  // POST /deposit   → realiza un depósito a la billetera del usuario
  // POST /transfer  → realiza un pago/transferencia a un destino externo
  // GET /:id        → consulta una transacción por su ID
  // GET /wallet/:id → lista las transacciones de una billetera
}
