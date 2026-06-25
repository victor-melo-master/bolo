// src/modules/auth/application/use-cases/login.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * LoginUseCase — Caso de Uso: Inicio de Sesión
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta la autenticación de usuarios:
 *   1. Busca usuario por número telefónico
 *   2. Verifica la contraseña contra el hash almacenado
 *   3. Verifica que el usuario esté activo (isActive = true)
 *   4. Genera una nueva llave JWT (rotación de sesión)
 *   5. Construye y firma un JWT con sub, phone, role y associationId
 *   6. Retorna token + datos básicos del usuario
 *
 * Dependencias inyectadas:
 *   - UserRepositoryPort: para buscar el usuario y actualizar su jwtKey
 *   - CryptoService: para comparar contraseñas
 *   - JwtService: para firmar el token JWT
 *
 * Capa: Aplicación (auth) — Caso de uso
 *
 * @module LoginUseCase
 */

// ─── Imports ─────────────────────────────────────────────────────────────────
import { Injectable, Inject } from '@nestjs/common';
// JwtService de @nestjs/jwt envuelve la librería jsonwebtoken y permite firmar
// tokens de forma declarativa usando la configuración del módulo (secret, expiración, etc.)
import { JwtService } from '@nestjs/jwt';
// Token string para la inyección del repositorio de usuarios (evita conflictos
// con el tipo de TypeScript que no existe en runtime)
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
// Servicio compartido de hashing para comparar contraseña contra hash almacenado
import { CryptoService } from '../../../../shared/application/services/crypto.service';
// Type-only import del puerto del repositorio (se elimina en compilación)
import type { UserRepositoryPort } from '../../domain/interfaces/repositories/user.repository.port';
// Excepción de dominio para credenciales inválidas (401 Unauthorized)
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
// randomUUID de crypto nativo de Node.js — genera UUID v4 criptográficamente seguro
import { randomUUID } from 'crypto';

// @Injectable: registra la clase como provider en el contenedor de NestJS
@Injectable()
export class LoginUseCase {
  constructor(
    // Se inyecta UserRepositoryPort mediante token string en lugar del tipo
    // directamente, porque la interfaz TypeScript desaparece en tiempo de
    // ejecución. El token USER_REPOSITORY_PORT es un string único que el
    // contenedor asocia a la implementación concreta (UserRepositoryImpl).
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
    // CryptoService es una clase concreta exportada, NestJS la resuelve por tipo
    private readonly cryptoService: CryptoService,
    // JwtService es una clase concreta de @nestjs/jwt, resuelta por tipo
    private readonly jwtService: JwtService,
  ) {}

  // execute: método público que recibe phone + password y retorna token + datos
  async execute(
    phone: string,
    password: string,
  ): Promise<{ accessToken: string; user: any }> {
    // ── Paso 1 — Buscar usuario por teléfono ──────────────────────────────────
    // Se busca en la base de datos usando el número telefónico como identificador
    // único. Si no existe, se lanza excepción con mensaje genérico "Invalid
    // credentials" para no revelar qué parte de la autenticación falló.
    const user = await this.userRepo.findByPhone(phone);
    if (!user) {
      throw new InvalidCredentialsException('Invalid credentials');
    }

    // ── Paso 2 — Verificar contraseña ──────────────────────────────────────────
    // CryptoService.compare() internamente usa bcrypt.compare() para comparar
    // la contraseña en texto plano contra el hash almacenado, protegiendo contra
    // timing attacks al ser una operación de tiempo constante.
    const isValid = await this.cryptoService.compare(
      password,
      user.passwordHash,
    );
    if (!isValid) {
      // Mismo mensaje genérico que arriba: el cliente no debe saber si el
      // teléfono existe o la contraseña es incorrecta (seguridad por oscuridad).
      throw new InvalidCredentialsException('Invalid credentials');
    }

    // ── Paso 3 — Verificar estado activo ───────────────────────────────────────
    // Usuarios desactivados (isActive === false) no pueden iniciar sesión,
    // por ejemplo si fueron suspendidos o eliminados de forma blanda (soft-delete).
    if (!user.isActive) {
      throw new InvalidCredentialsException('User is inactive');
    }

    // ── Paso 4 — Rotación de llave JWT ────────────────────────────────────────
    // Por seguridad, en cada inicio de sesión se genera una nueva llave UUID
    // que se asocia al usuario. Esto invalida tokens anteriores emitidos con
    // llaves viejas (si el mecanismo de verificación las chequea).
    // randomUUID() de Node.js crypto genera UUID v4 criptográficamente seguro.
    const newJwtKey = randomUUID();
    // Persistir la nueva llave: se actualiza el registro del usuario en la BD.
    // En el futuro, el JWT podría firmarse con esta llave o almacenarse para
    // invalidación de sesiones.
    await this.userRepo.updateJwtKey(user.id, newJwtKey);

    // ── Paso 5 — Construir y firmar JWT ───────────────────────────────────────
    // El payload del JWT contiene los claims estándar: sub (subject) con el ID
    // del usuario, phone y role para autorización en los controladores. No se
    // incluyen datos sensibles como passwordHash.
    // associationId se incluye para que los sub‑admins puedan heredar la asociación
    // de su creador sin necesidad de consultar la base de datos.
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      associationId: user.associationId, // ← Permite que el token sepa a qué asociación pertenece el usuario
    };
    // jwtService.sign() firma el payload usando la llave personal del usuario
    // (newJwtKey) en lugar del secreto global. Esto garantiza que si la llave
    // cambia (nueva sesión), los tokens anteriores quedan inválidos.
    const accessToken = this.jwtService.sign(payload, {
      secret: newJwtKey, // ← usar la llave del usuario, NO 'unused'
      expiresIn: '24h',
    });
    return {
      accessToken, // JWT firmado para el cliente
      user: {
        // datos básicos (sin hash, sin llaves)
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        associationId: user.associationId, // ← También se devuelve en la respuesta para conveniencia del frontend
      },
    };
  }
}
