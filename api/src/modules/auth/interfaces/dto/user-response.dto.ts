// src/modules/auth/interfaces/dto/user-response.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UserResponseDto — DTO de Respuesta para Datos de Usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Define la estructura de los datos de usuario expuestos al cliente.
 * Oculta campos sensibles como passwordHash, jwtKey, qrKey, etc.
 *
 * Se usa como tipo de retorno en:
 *   - POST /auth/register
 *   - GET /auth/profile (futuro)
 *   - GET /users/:id (futuro)
 *
 * Capa: Interfaces (auth) — DTO de salida
 *
 * @module UserResponseDto
 *
 * NOTA: UserResponseDto es un DTO de salida sin validación ni lógica
 * de negocio. Solo define la estructura de datos que se envía al cliente.
 *
 * No requiere tests unitarios específicos porque:
 *   - No tiene decoradores de class-validator que necesiten ser probados.
 *   - No tiene métodos ni comportamiento.
 * Su estructura ya queda verificada indirectamente en los tests del
 * controlador (auth.controller.spec.ts), donde se usa como tipo de
 * retorno esperado.
 */

// ApiProperty / ApiPropertyOptional: decoradores de Swagger para documentar
// la respuesta de la API en OpenAPI. Aunque UserResponseDto es un DTO de
// salida (no se valida con class-validator), los decoradores de Swagger son
// necesarios para que la documentación generada automáticamente refleje la
// estructura exacta de la respuesta que verá el cliente.
// - ApiProperty: campo siempre presente en la respuesta
// - ApiPropertyOptional: campo que puede ser null/undefined
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  // ─── id ───
  // UUID único del usuario, generado por la BD (gen_random_uuid())
  @ApiProperty({ description: 'ID del usuario' })
  id: string;

  // ─── phone ───
  // Número telefónico en formato E.164, identificador principal del usuario
  @ApiProperty({ description: 'Número de teléfono' })
  phone: string;

  // ─── email (opcional) ───
  // Puede ser null si el usuario se registró solo con teléfono
  @ApiPropertyOptional({ description: 'Correo electrónico' })
  email?: string;

  // ─── fullName ───
  @ApiProperty({ description: 'Nombre completo' })
  fullName: string;

  // ─── role ───
  // Rol del usuario: passenger, driver, association_admin o super_admin
  @ApiProperty({ description: 'Rol del usuario' })
  role: string;

  // ─── category ───
  // Categoría tarifaria: normal, student o elderly
  @ApiProperty({ description: 'Categoría tarifaria' })
  category: string;

  // ─── isActive ───
  // Indica si la cuenta está activa (soft delete cuando es false)
  @ApiProperty({ description: 'Si el usuario está activo' })
  isActive: boolean;

  // ─── createdAt ───
  // Fecha y hora de creación del registro en la BD
  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;
}
