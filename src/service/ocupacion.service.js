// src/api/ocupacion.service.js
import { api } from './apiClient';

/**
 * Crear una Ocupación
 * @param {{ adolescenteId: number, taller: string, institucion: string, fecha: string, ... }} payload
 * @returns {Promise<any>}
 */
export function createOcupacion(payload) {
  return api.post('/ocupacion', payload);
}

/**
 * Obtener lista de Ocupaciones paginadas
 * Permite filtros: termino (nombre taller), adolescenteId, page, size
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getOcupaciones(params) {
  return api.get('/ocupacion', { params });
}

/**
 * Obtener una Ocupación por ID
 * @param {number} id
 * @returns {Promise<any>}
 */
export function getOcupacionById(id) {
  return api.get(`/ocupacion/${id}`);
}

/**
 * Actualizar una Ocupación
 * @param {number} id
 * @param {any} payload
 * @returns {Promise<any>}
 */
export function updateOcupacion(id, payload) {
  return api.patch(`/ocupacion/${id}`, payload);
}

// Nota: El backend tiene el método DELETE comentado. 
// Si decides habilitarlo en el futuro, sería así:
/*
export function deleteOcupacion(id) {
  return api.delete(`/ocupacion/${id}`);
}
*/