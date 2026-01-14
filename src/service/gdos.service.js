// src/api/gdos.service.js
import { api } from './apiClient';

/**
 * Crear un GDO (Grupo de Delincuencia Organizada)
 * @param {{ nombre: string }} payload
 * @returns {Promise<any>}
 */
export function createGdo(payload) {
  return api.post('/gdos', payload);
}

/**
 * Obtener lista de GDOs paginados
 * Permite filtros: nombre, page, size
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getGdos(params) {
  return api.get('/gdos', { params });
}

/**
 * Actualizar un GDO
 * @param {number} id
 * @param {{ nombre: string }} payload
 * @returns {Promise<any>}
 */
export function updateGdo(id, payload) {
  return api.patch(`/gdos/${id}`, payload);
}

/**
 * Eliminar un GDO
 * @param {number} id
 * @returns {Promise<any>}
 */
export function deleteGdo(id) {
  return api.delete(`/gdos/${id}`);
}