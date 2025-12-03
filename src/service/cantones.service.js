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
