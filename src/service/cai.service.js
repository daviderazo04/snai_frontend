// src/api/cai.service.js
import { api } from './apiClient';

/**
 * Crear un CAI
 * @param {CaiPayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createCai(payload) {
  return api.post('/cai', payload);
}

/**
 * Obtener lista de CAIs
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getCais(params) {
  return api.get('/cai', { params });
}

/**
 * Actualizar un CAI
 * @param {number|string} id
 * @param {CaiPayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function updateCai(id, payload) {
  return api.put(`/cai/${id}`, payload);
}

/**
 * Eliminar un CAI
 * @param {number|string} id
 * @returns {Promise<any>}
 */
export function deleteCai(id) {
  return api.delete(`/cai/${id}`);
}
