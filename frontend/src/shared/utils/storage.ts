// src/shared/utils/storage.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * storage — Utilidades de localStorage para autenticación
 * ═══════════════════════════════════════════════════════════════
 *
 * Funciones simples para setear, obtener y eliminar el token de
 * autenticación en localStorage. (Actualmente no usado desde que
 * authStore maneja la persistencia con zustand/middleware.)
 *
 * Capa: utility
 * Dependencias: none
 *
 * @module storage
 */
const TOKEN_KEY = 'auth_token';

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);
