// src/api/nacionalidad.service.js
import { api } from './apiClient';

/**
 * Crear una nacionalidad
 * @param {{ nombre: string }} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createNacionalidad(payload) {
  return api.post('/nacionalidad', payload);
}

/**
 * Obtener lista de nacionalidades
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getNacionalidades(params) {
  return api.get('/nacionalidad', { params });
}
