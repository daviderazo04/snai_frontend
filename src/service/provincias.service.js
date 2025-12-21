// src/api/provincias.service.js
import { api } from './apiClient';

/**
 * Crear una provincia
 * @param {ProvinciaPayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createProvincia(payload) {
  return api.post('/provincias', payload);
}

/**
 * Obtener lista de provincias
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getProvincias(params) {
  return api.get('/provincias', { params });
}

/**
 * Actualizar una provincia
 * @param {number|string} id
 * @param {ProvinciaPayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function updateProvincia(id, payload) {
  return api.put(`/provincias/${id}`, payload);
}

/**
 * Eliminar una provincia
 * @param {number|string} id
 * @returns {Promise<any>}
 */
export function deleteProvincia(id) {
  return api.delete(`/provincias/${id}`);
}
