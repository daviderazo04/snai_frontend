// src/api/parentesco.service.js
import { api } from './apiClient';

/**
 * Crear un tipo de parentesco
 * @param {{ nombre: string }} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createParentesco(payload) {
  return api.post('/parentesco', payload);
}

/**
 * Obtener lista de tipos de parentesco
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getParentescos(params) {
  return api.get('/parentesco', { params });
}
