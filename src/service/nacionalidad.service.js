// src/api/nacionalidad.service.js
import { api } from './apiClient';

/**
 * Crear una nacionalidad
 * @param {{ nombre: string }} payload
 * @returns {Promise<any>}
 */
export function createNacionalidad(payload) {
  return api.post('/nacionalidad', payload);
}

/**
 * Obtener lista de nacionalidades paginada
 * Permite filtros: nombre, page, size
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getNacionalidades(params) {
  return api.get('/nacionalidad', { params });
}

/**
 * Actualizar una nacionalidad
 * @param {number} id
 * @param {{ nombre: string }} payload
 * @returns {Promise<any>}
 */
export function updateNacionalidad(id, payload) {
  return api.patch(`/nacionalidad/${id}`, payload);
}

/**
 * Eliminar una nacionalidad
 * @param {number} id
 * @returns {Promise<any>}
 */
export function deleteNacionalidad(id) {
  return api.delete(`/nacionalidad/${id}`);
}