// src/api/estadoCivil.service.js
import { api } from './apiClient';

/**
 * Crear un estado civil
 * @param {{ nombre: string }} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createEstadoCivil(payload) {
  return api.post('/estado-civil', payload);
}

/**
 * Obtener estados civiles
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getEstadosCiviles(params) {
  return api.get('/estado-civil', { params });
}

/**
 * Actualizar un estado civil
 * @param {number|string} id
 * @param {{ nombre: string }} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function updateEstadoCivil(id, payload) {
  return api.patch(`/estado-civil/${id}`, payload);
}

/**
 * Eliminar un estado civil
 * @param {number|string} id
 * @returns {Promise<any>}
 */
export function deleteEstadoCivil(id) {
  return api.delete(`/estado-civil/${id}`);
}
