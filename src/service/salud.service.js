// src/api/salud.service.js
import { api } from './apiClient';

/**
 * Crear un registro de Salud
 * @param {{ adolescenteId: number, fecha: string, diagnostico: string, tomaMedicacion: boolean, ... }} payload
 * @returns {Promise<any>}
 */
export function createSalud(payload) {
  return api.post('/salud', payload);
}

/**
 * Obtener lista de registros de Salud paginados
 * Params: page, size
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getSalud(params) {
  return api.get('/salud', { params });
}

/**
 * Actualizar un registro de Salud
 * NOTA: El backend usa PUT para este módulo (reemplazo completo o parcial según lógica)
 * @param {number} id
 * @param {any} payload
 * @returns {Promise<any>}
 */
export function updateSalud(id, payload) {
  return api.put(`/salud/${id}`, payload);
}

/**
 * Eliminar (lógicamente) un registro de Salud
 * @param {number} id
 * @returns {Promise<any>}
 */
export function deleteSalud(id) {
  return api.delete(`/salud/${id}`);
}