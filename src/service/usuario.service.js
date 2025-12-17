// src/api/usuario.service.js
import { api } from './apiClient';

/**
 * Asignar perfiles a un usuario
 * POST /usuario/:id/perfil
 * @param {number} id
 * @param {PerfilAsignarPayload} payload  // { perfiles: number[] }
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function asignarPerfil(id, payload) {
  return api.post(`/usuario/${id}/perfil`, payload);
}

/**
 * Obtener usuarios del sistema
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getUsuarios(params) {
  return api.get('/usuario', { params });
}
