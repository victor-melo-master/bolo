// src/modules/auth/domain/entities/user.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * User — Entidad de Dominio de Usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa un usuario del sistema BOLO. Puede ser pasajero,
 * conductor, administrador de cooperativa o superadministrador.
 *
 * Roles (UserRole):
 *   - passenger:         usuario que solicita viajes
 *   - driver:            conductor que presta el servicio
 *   - association_admin: administrador de una cooperativa
 *   - super_admin:       administrador global del sistema
 *
 * Categorías tarifarias (UserCategory):
 *   - normal:  tarifa estándar
 *   - student: tarifa estudiantil (requiere documento aprobado)
 *   - elderly: tarifa de adulto mayor
 *
 * Soporta soft-delete (deletedAt) y tracking de último login.
 * Los QR codes (qrCode, qrKey, qrVersion) se usan para emisión
 * de tickets digitales o identificación rápida del conductor.
 *
 * Capa: Dominio (auth)
 * Método de fábrica:
 *   User.create(data) — construye un nuevo usuario con defaults
 *     sensatos (isActive: true, qrVersion: 1, etc.)
 *
 * @module User
 * @see UserRole
 * @see UserCategory
 */

// Tipo unión para los roles del sistema — restringe los valores posibles en tiempo de compilación
export type UserRole =
  | 'passenger'
  | 'driver'
  | 'association_admin'
  | 'super_admin';
// Tipo unión para las categorías tarifarias — cada una aplica reglas de negocio distintas al calcular tarifas
export type UserCategory = 'normal' | 'student' | 'elderly';

export class User {
  constructor(
    // readonly — una vez asignado, el valor no puede mutarse; garantiza inmutabilidad de la entidad
    public readonly id: string, // Identificador único (UUID v4, migrar a v7 con PG 18)
    public readonly phone: string, // Número de teléfono (login principal, único en la BD)
    public readonly email: string | null, // Email opcional — no se exige en registro, pero sirve para recuperación
    public readonly passwordHash: string, // Hash bcrypt de la contraseña — nunca se almacena texto plano por seguridad
    public readonly fullName: string, // Nombre completo visible para otros usuarios y tickets
    public readonly cedula: string | null, // Cédula venezolana — opcional, requerida solo para conductores por regulación
    public readonly role: UserRole, // Rol — determina permisos y acceso a funcionalidades
    public readonly associationId: string | null, // Id de la asociacion a la que pertenece un usuario si es 'drive' o 'association_admin' ← nuevo
    public readonly jwtKey: string | null, // Clave única por sesión — permite invalidar JWT activos al cambiar contraseña
    public readonly qrCode: string | null, // Código QR escaneable — identificación rápida del conductor/pasajero
    public readonly qrKey: string | null, // Clave de cifrado asociada al QR — seguridad del código generado
    public readonly qrVersion: number, // Versión del formato QR — permite migrar sin romper códigos existentes
    public readonly category: UserCategory, // Categoría tarifaria — afecta el cálculo de precios en los viajes
    public readonly studentDocApproved: boolean, // True si el documento estudiantil fue verificado — controla tarifa especial
    public readonly isActive: boolean, // Soft-delete visible — false si el usuario fue desactivado, no eliminado
    public readonly deletedAt: Date | null, // Marca de eliminación lógica (soft-delete) — nulo si no fue eliminado
    public readonly lastLoginAt: Date | null, // Timestamp del último inicio de sesión — auditoría y detección de inactividad
    public readonly createdAt: Date, // Fecha de creación — inmutable, se asigna una sola vez
    public readonly updatedAt: Date, // Fecha de última modificación — se actualiza en cada cambio significativo
  ) {}

  // Método de fábrica estático — encapsula la construcción con valores por defecto y oculta el constructor
  static create(
    // Omit omite los campos generados automáticamente; id es opcional para permitir asignación externa
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): User {
    return new User(
      data.id ?? crypto.randomUUID(), // Si no se pasa id, se genera automáticamente con UUID v4
      data.phone,
      data.email ?? null, // Normaliza undefined → null para consistencia con la BD
      data.passwordHash,
      data.fullName,
      data.cedula ?? null,
      data.role,
      data.associationId ?? null,
      data.jwtKey ?? null,
      data.qrCode ?? null,
      data.qrKey ?? null,
      data.qrVersion ?? 1, // Por defecto versión 1 — compatible con lectores actuales
      data.category,
      data.studentDocApproved ?? false, // Por seguridad, nunca aprobar documento sin verificación explícita
      data.isActive ?? true, // Por defecto el usuario se crea activo — requiere desactivación explícita
      data.deletedAt ?? null,
      data.lastLoginAt ?? null, // Nunca ha iniciado sesión — se asigna en el primer login
      new Date(), // createdAt — se fija al momento de la creación
      new Date(), // updatedAt — inicialmente igual que createdAt
    );
  }
}
