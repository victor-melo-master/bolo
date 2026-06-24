// src/modules/auth/application/dto/index.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports para DTOs de aplicación del módulo auth.
 * ═══════════════════════════════════════════════════════════════
 *
 * Este archivo actúa como punto de entrada (barrel) para importar
 * todos los DTOs de la capa de aplicación del módulo auth desde un
 * solo lugar: import { CreateUserDto } from '.../dto'.
 *
 * Ventajas del barrel:
 *   - Simplifica las importaciones: los consumidores importan desde
 *     '.../dto' en lugar de rutas individuales.
 *   - Oculta la estructura interna del directorio dto/.
 *   - Si se agrega un nuevo DTO, solo se añade una línea aquí.
 *
 * Nota: LoginDto no se exporta actualmente porque no se importa
 * desde fuera del módulo o se usa directamente en el controlador
 * con un DTO de interfaz diferente (LoginRequestDto). Si en el
 * futuro se necesita, agregar:
 *   export { LoginDto } from './logint.dto';
 *
 * @module auth/application/dto
 */

// Exportación del DTO de creación de usuario (caso de uso CreateUserUseCase)
export { CreateUserDto } from './create-user.dto';
