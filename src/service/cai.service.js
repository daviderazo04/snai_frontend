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
