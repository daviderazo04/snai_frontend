// src/api/gdos.service.js
import { api } from './apiClient';

/**
 * Crear un GDOS
 * @param {{ nombre: string }} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createGdos(payload) {
  return api.post('/gdos', payload);
}

/**
 * Obtener lista de GDOS
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getGdos(params) {
  return api.get('/gdos', { params });
}
