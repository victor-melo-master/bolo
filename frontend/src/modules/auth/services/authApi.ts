// src/modules/auth/services/authApi.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * authApi — Llamadas a la API de autenticación
 * ═══════════════════════════════════════════════════════════════
 *
 * Agrupa todas las operaciones del módulo auth (login, registro,
 * perfil, cambio de contraseña, eliminación de cuenta) separadas
 * por rol: pasajero (/auth/passenger) y admin (/auth/admin).
 *
 * Capa: service (API calls)
 * Dependencias: apiClient, auth types
 *
 * @module authApi
 */
import { apiClient } from '../../../api/client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterPassengerRequest,
  CreateAdminRequest,
  PassengerProfile,
  AdminProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types';

const passengerBase = '/auth/passenger';
const adminBase = '/auth/admin';

// ── Pasajero ──
export const registerPassenger = (data: RegisterPassengerRequest) =>
  apiClient<LoginResponse>(`${passengerBase}/register`, { method: 'POST', body: data });

export const loginPassenger = (data: LoginRequest) =>
  apiClient<LoginResponse>(`${passengerBase}/login`, { method: 'POST', body: data });

export const getPassengerProfile = () =>
  apiClient<PassengerProfile>(`${passengerBase}/profile`);

export const updatePassengerProfile = (data: UpdateProfileRequest) =>
  apiClient<PassengerProfile>(`${passengerBase}/profile`, { method: 'PUT', body: data });

export const changePassengerPassword = (data: ChangePasswordRequest) =>
  apiClient<void>(`${passengerBase}/password`, { method: 'PUT', body: data });

export const deletePassengerAccount = () =>
  apiClient<void>(`${passengerBase}/profile`, { method: 'DELETE' });

// ── Admin ──
export const loginAdmin = (data: LoginRequest) =>
  apiClient<LoginResponse>(`${adminBase}/login`, { method: 'POST', body: data });

export const createAdmin = (data: CreateAdminRequest) =>
  apiClient<AdminProfile>(`${adminBase}/create`, { method: 'POST', body: data });

export const getAdminProfile = () =>
  apiClient<AdminProfile>(`${adminBase}/profile`);

export const updateAdminProfile = (data: UpdateProfileRequest) =>
  apiClient<AdminProfile>(`${adminBase}/profile`, { method: 'PUT', body: data });

export const changeAdminPassword = (data: ChangePasswordRequest) =>
  apiClient<void>(`${adminBase}/password`, { method: 'PUT', body: data });

export const deleteAdminAccount = () =>
  apiClient<void>(`${adminBase}/profile`, { method: 'DELETE' });
