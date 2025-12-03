// src/api/ocupacion.service.js
import { api } from './apiClient';

/**
 * Crear una ocupación para un adolescente
 * @param {CreateOcupacionDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createOcupacion(payload) {
  return api.post('/ocupacion', payload);
}

/**
 * Obtener lista de ocupaciones
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getOcupaciones(params) {
  return api.get('/ocupacion', { params });
}

/**
 * Obtener ocupación por ID
 * @param {number} id
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function getOcupacion(id) {
  return api.get(`/ocupacion/${id}`);
}

/**
 * Actualizar ocupación
 * @param {number} id
 * @param {CreateOcupacionDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function updateOcupacion(id, payload) {
  return api.patch(`/ocupacion/${id}`, payload);
}

/**
 * Eliminar ocupación
 * @param {number} id
 * @returns {Promise<import('./snai-dtos').SimpleResult>}
 */
export function deleteOcupacion(id) {
  return api.delete(`/ocupacion/${id}`);
}
