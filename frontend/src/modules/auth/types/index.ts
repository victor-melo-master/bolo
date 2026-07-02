// src/modules/auth/types/index.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * auth types — Tipos y guards del módulo de autenticación
 * ═══════════════════════════════════════════════════════════════
 *
 * Define las interfaces PassengerProfile, AdminProfile y los tipos
 * para login, registro, actualización de perfil y cambio de
 * contraseña. Incluye type guards isAdminProfile / isPassengerProfile.
 *
 * Capa: types
 * Dependencias: none
 *
 * @module authTypes
 */
// ── Usuario base (respuesta de login / perfil) ──
export interface PassengerProfile {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  cedula?: string;
  category: 'normal' | 'student' | 'elderly';
  isActive: boolean;
  createdAt: string;
}

export interface AdminProfile {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  cedula?: string;
  role: 'super_admin' | 'association_admin' | 'driver';
  isActive: boolean;
  createdAt: string;
}

export type UserProfile = PassengerProfile | AdminProfile;

// ── Login ──
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserProfile;
}

// ── Registro de pasajero ──
export interface RegisterPassengerRequest {
  phone: string;
  password: string;
  fullName: string;
  email?: string;
  cedula?: string;
  category: 'normal' | 'student' | 'elderly';
}

// ── Creación de admin ──
export interface CreateAdminRequest {
  phone: string;
  password: string;
  fullName: string;
  email?: string;
  cedula?: string;
  role: 'driver' | 'association_admin' | 'super_admin';
}

// ── Actualización de perfil ──
export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  cedula?: string;
  category?: 'normal' | 'student' | 'elderly'; // solo pasajero
  // role?: 'super_admin' | 'association_admin' | 'driver'; // solo admin (requiere super_admin)
}

// ── Cambio de contraseña ──
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

// ── Tipos auxiliares ──
export type UserType = 'passenger' | 'admin';

export function isAdminProfile(user: UserProfile): user is AdminProfile {
  return 'role' in user;
}

export function isPassengerProfile(user: UserProfile): user is PassengerProfile {
  return 'category' in user;
}