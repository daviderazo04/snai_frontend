// src/api/auth.service.js
import { api } from './apiClient';

/**
 * Iniciar sesión
 * @param {LoginPayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
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
 * Ganar acceso según perfil asignado
 * @param {PerfilDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function gainAccess(payload) {
  return api.post('/auth/perfil', payload);
}

/**
 * Obtener perfil del usuario autenticado
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function getProfile() {
  return api.get('/auth/profile');
}
