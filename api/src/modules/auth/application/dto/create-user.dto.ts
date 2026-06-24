// src/modules/auth/application/dto/create-user.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateUserDto — DTO de Aplicación para Crear Usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Objeto de transferencia de datos que recibe el caso de uso
 * CreateUserUseCase desde el controlador. Contiene los datos
 * necesarios para el registro de un nuevo usuario.
 *
 * Diferencia con RegisterDto (interfaces/dto):
 *   - RegisterDto tiene decoradores de validación y Swagger
 *   - CreateUserDto es un DTO interno, sin decoradores, usado
 *     dentro de la capa de aplicación
 *
 * Capa: Aplicación (auth) — DTO de entrada
 *
 * @module CreateUserDto
 * @see RegisterDto
 */

// ─── Imports ─────────────────────────────────────────────────────────────────
// Se importan los tipos de dominio UserRole y UserCategory desde la entidad
// para tipar correctamente los campos role y category.
// Nota: estos son tipos/valores exportados por la entidad, no clases.
import { UserRole, UserCategory } from '../../domain/entities/user.entity';

// ─── DTO de Aplicación ──────────────────────────────────────────────────────
// Diferencia clave entre DTO de aplicación y DTO de interfaz (RegisterDto):
//
// RegistroDto (capa de interfaces/controladores):
//   - Usa decoradores de validación (@IsString, @IsPhoneNumber, @IsEnum, etc.)
//     para validar datos de entrada en el pipe de NestJS.
//   - Usa decoradores de Swagger (@ApiProperty) para documentación OpenAPI.
//   - Es más pesado: incluye metadatos de runtime para class-validator y swagger.
//
// CreateUserDto (capa de aplicación — ESTE ARCHIVO):
//   - Es un DTO interno, plano, SIN decoradores de ningún tipo.
//   - No consume memoria con metadatos de validación.
//   - Se usa exclusivamente dentro de la capa de aplicación (casos de uso).
//   - Los datos ya fueron validados por el pipe antes de llegar aquí.
//   - Es más limpio y fácil de mockear en tests.
//
// Esta separación (interfaces vs application) sigue el principio de que
// la capa de aplicación no debe depender de decoradores de frameworks externos
// (NestJS/class-validator/Swagger).
export class CreateUserDto {
  // ─── Campos obligatorios ──────────────────────────────────────────────────
  phone: string;          // Número telefónico (identificador único del usuario)
  password: string;       // Contraseña en texto plano (se hashea antes de persistir)
  fullName: string;       // Nombre completo para mostrar en perfiles y comunicaciones
  role: UserRole;         // Rol del usuario: 'passenger' | 'driver' | 'admin'
  category: UserCategory; // Categoría: 'normal' | 'estudiante' etc.

  // ─── Campos opcionales ────────────────────────────────────────────────────
  email?: string;         // Correo electrónico (opcional, útil para recuperación)
  cedula?: string;        // Cédula de identidad (opcional, requerida para ciertos roles)
}
