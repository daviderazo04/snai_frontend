// src/api/usuario.service.js
import { api } from './apiClient';

/**
 * Asignar un perfil a un usuario
 * @param {PerfilAsignarPayload} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function asignarPerfil(payload) {
  return api.post('/usuario/perfil', payload);
}

/**
 * Obtener usuarios del sistema
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getUsuarios(params) {
  return api.get('/usuario', { params });
}
