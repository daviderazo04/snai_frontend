// src/api/cantones.service.js
import { api } from './apiClient';

/**
 * Crear un cantón
 * @param {CantonPayload} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createCanton(payload) {
  return api.post('/cantones', payload);
}

/**
 * Obtener cantones
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getCantones(params) {
  return api.get('/cantones', { params });
}

/**
 * Actualizar un canton
 * @param {number|string} id
 * @param {CantonPayload} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function updateCanton(id, payload) {
  return api.patch(`/cantones/${id}`, payload);
}

/**
 * Eliminar un canton
 * @param {number|string} id
 * @returns {Promise<any>}
 */
export function deleteCanton(id) {
  return api.delete(`/cantones/${id}`);
}
