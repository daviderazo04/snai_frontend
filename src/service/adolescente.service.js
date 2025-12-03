// src/api/adolescente.service.js
import { api } from './apiClient';

/**
 * Crear un adolescente
 * @param {AdolescentePayloadDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createAdolescente(payload) {
  return api.post('/adolescentes', payload);
}

/**
 * Obtener lista de adolescentes
 * @param {{
 *   nombre?: string,
 *   cedula?: string,
 *   page?: number,
 *   size?: number
 * }} [params]
 * @returns {Promise<import('./snai-dtos').PaginatedResult<any>>}
 */
export function getAdolescentes(params) {
  return api.get('/adolescentes', { params });
}
