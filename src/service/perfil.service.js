// src/api/perfil.service.js
import { api } from './apiClient';

/**
 * Crear un perfil
 * @param {PerfilPayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createPerfil(payload) {
  return api.post('/perfil', payload);
}

/**
 * Actualizar un perfil existente
 * @param {number} id
 * @param {PerfilUpdatePayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function updatePerfil(id, payload) {
  return api.put(`/perfil/${id}`, payload);
}

/**
 * Obtener lista de perfiles
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getPerfiles(params) {
  return api.get('/perfil', { params });
}
