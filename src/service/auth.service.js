// src/api/auth.service.js
import { api } from './apiClient';

/**
 * Iniciar sesión (ahora por cédula)
 * @param {LoginPayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<LoginResponseData>>}
 */
export function login(payload) {
  return api.post('/auth/login', payload);
}

/**
 * Registrar usuario
 * @param {RegisterPayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function register(payload) {
  return api.post('/auth/register', payload);
}

/**
 * Seleccionar perfil activo / ganar acceso
 * Backend REAL: POST /auth/gain-access
 * @param {PerfilDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<LoginResponseData>>}
 */
export function gainAccess(payload) {
  return api.post('/auth/gain-access', payload);
}

/**
 * Obtener perfil del usuario autenticado
 * @returns {Promise<import('./snai-dtos').ResultWithData<JwtUser>>}
 */
export function getProfile() {
  return api.get('/auth/profile');
}
