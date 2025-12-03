// src/api/juridico.service.js
import { api } from './apiClient';

/**
 * Crear un registro jurídico para un adolescente
 * @param {CreateJuridicoDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createJuridico(payload) {
  return api.post('/juridico', payload);
}

/**
 * Obtener lista de registros jurídicos
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getJuridicos(params) {
  return api.get('/juridico', { params });
}

/**
 * Obtener registro jurídico por ID
 * @param {number} id
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function getJuridico(id) {
  return api.get(`/juridico/${id}`);
}

/**
 * Actualizar un registro jurídico
 * @param {number} id
 * @param {CreateJuridicoDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function updateJuridico(id, payload) {
  return api.patch(`/juridico/${id}`, payload);
}

/**
 * Eliminar un registro jurídico
 * @param {number} id
 * @returns {Promise<import('./snai-dtos').SimpleResult>}
 */
export function deleteJuridico(id) {
  return api.delete(`/juridico/${id}`);
}
