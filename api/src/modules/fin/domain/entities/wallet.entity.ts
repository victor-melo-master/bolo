// src/modules/fin/domain/entities/wallet.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Wallet — Entidad de Dominio de Billetera Digital
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa la billetera digital de un usuario en el sistema BOLO.
 *
 * Características:
 *   - balance:      saldo disponible en centavos (BIGINT) — sin floats
 *   - debtBalance:  saldo de crédito de emergencia usado
 *   - creditUsed:   flag que indica si ya usó el crédito de emergencia
 *   - currency:     código ISO 4217 (USD, VED, etc.)
 *   - version:      control de concurrencia optimista (OCC) para evitar
 *                   condiciones de carrera en operaciones concurrentes
 *
 * Reglas de negocio:
 *   - Los montos siempre se almacenan en centavos (enteros) para
 *     evitar errores de redondeo por punto flotante
 *   - El crédito de emergencia es de uso único por usuario
 *   - Cada actualización incrementa version; si two escritores
 *     concurrentes detectan version distinta, uno debe reintentar
 *
 * Capa: Dominio (fin)
 * Método de fábrica:
 *   Wallet.create(userId, currency) — crea billetera con saldo 0
 *
 * @module Wallet
 */

export class Wallet {
  constructor(
    // Identificador único UUID de la billetera, generado en el dominio (no autoincremental)
    public readonly id: string,
    // ID del usuario propietario; relación 1:1 con users — una billetera por usuario
    public readonly userId: string,
    // Saldo disponible en centavos (entero). Se usa BIGINT en BD para evitar errores de redondeo
    // con punto flotante (IEEE 754). Ej: $10.50 → 1050 centavos. Toda conversión a decimal ocurre
    // solo en presentación (frontend), nunca en lógica de negocio.
    public readonly balance: number,
    // Saldo de deuda por crédito de emergencia, también en centavos. Cuando el usuario agota su
    // saldo normal (balance), puede activar el crédito de emergencia (uso único) y los montos
    // de viajes se acumulan aquí hasta que pague la deuda.
    public readonly debtBalance: number,
    // Flag que indica si el usuario ya usó su crédito de emergencia. Una vez true, no puede
    // volver a activarlo. Se resetea solo administrativamente cuando salda la deuda completa.
    public readonly creditUsed: boolean,
    // Código de moneda ISO 4217 (Ej: "USD", "VED"). Define la unidad en que se expresan
    // balance y debtBalance. Todas las operaciones respetan esta moneda.
    public readonly currency: string,
    // Timestamp de la última transacción sobre la billetera. null si nunca se ha transado.
    // Útil para auditoría y para decidir si aplicar cargos por inactividad (a futuro).
    public readonly lastTransactionAt: Date | null,
    // Control de concurrencia optimista (OCC). Se incrementa en cada escritura. Al actualizar,
    // la query incluye WHERE version = :versionAnterior; si no coincide (otro proceso escribió
    // primero), se lanza error y el cliente debe reintentar la operación. Previene condiciones
    // de carrera sin necesidad de locks pesados en la BD.
    public readonly version: number,
    // Fecha de creación de la billetera. Inmutable.
    public readonly createdAt: Date,
    // Fecha de la última modificación. Se actualiza automáticamente en cada cambio.
    public readonly updatedAt: Date,
  ) {}

  // Método de fábrica: crea una billetera nueva con saldo 0, sin crédito usado, versión 1.
  // Este método encapsula la inicialización consistente del agregado Wallet.
  static create(userId: string, currency: string = 'USD'): Wallet {
    return new Wallet(
      crypto.randomUUID(), // Genera UUID v4 único como identificador de la billetera
      userId,
      0,                  // balance inicial en cero — el usuario debe recargar antes de usar
      0,                  // debtBalance inicial en cero — no hay deuda al crear
      false,              // creditUsed: false — el crédito de emergencia aún está disponible
      currency,           // moneda por defecto USD (dólar estadounidense)
      null,               // lastTransactionAt: null — nunca ha transado
      1,                  // version: 1 — primera versión del registro
      new Date(),         // createdAt: momento de creación
      new Date(),         // updatedAt: igual a createdAt inicialmente
    );
  }
}
