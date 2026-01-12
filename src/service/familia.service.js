// src/api/familia.service.js
import { api } from './apiClient';

/**
 * Crear un registro de Familia
 * @param {{ adolescenteId: number, eventoId: number, detalle: string, fecha: string, observacion?: string }} payload
 * @returns {Promise<any>}
 */
export function createFamilia(payload) {
  return api.post('/familia', payload);
}

/**
 * Obtener lista de registros de Familia paginados
 * Permite filtros: termino, adolescenteId, eventoId, page, size
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getFamilias(params) {
  return api.get('/familia', { params });
}

/**
 * Obtener un registro de Familia por ID
 * @param {number} id
 * @returns {Promise<any>}
 */
export function getFamiliaById(id) {
  return api.get(`/familia/${id}`);
}

/**
 * Actualizar un registro de Familia
 * @param {number} id
 * @param {Partial<{ adolescenteId: number, eventoId: number, detalle: string, fecha: string, observacion: string }>} payload
 * @returns {Promise<any>}
 */
export function updateFamilia(id, payload) {
  return api.patch(`/familia/${id}`, payload);
}

/**
 * Eliminar un registro de Familia
 * @param {number} id
 * @returns {Promise<any>}
 */
export function deleteFamilia(id) {
  return api.delete(`/familia/${id}`);
}