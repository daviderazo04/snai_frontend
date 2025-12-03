// src/api/etnia.service.js
import { api } from './apiClient';

/**
 * Crear una etnia
 * @param {{ nombre: string }} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createEtnia(payload) {
  return api.post('/etnia', payload);
}

/**
 * Obtener lista de etnias
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getEtnias(params) {
  return api.get('/etnia', { params });
}
