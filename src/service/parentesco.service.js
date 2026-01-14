// src/api/parentesco.service.js
import { api } from './apiClient';

/**
 * Crear un Parentesco
 * @param {{ nombre: string }} payload
 * @returns {Promise<any>}
 */
export function createParentesco(payload) {
  return api.post('/parentesco', payload);
}

/**
 * Obtener lista de Parentescos paginados
 * Permite filtros: nombre, page, size
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getParentescos(params) {
  return api.get('/parentesco', { params });
}

/**
 * Obtener un Parentesco por ID
 * @param {number} id
 * @returns {Promise<any>}
 */
export function getParentescoById(id) {
  return api.get(`/parentesco/${id}`);
}

/**
 * Actualizar un Parentesco
 * @param {number} id
 * @param {{ nombre: string }} payload
 * @returns {Promise<any>}
 */
export function updateParentesco(id, payload) {
  return api.patch(`/parentesco/${id}`, payload);
}

/**
 * Eliminar un Parentesco
 * @param {number} id
 * @returns {Promise<any>}
 */
export function deleteParentesco(id) {
  return api.delete(`/parentesco/${id}`);
}