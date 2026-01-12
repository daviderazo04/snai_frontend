// src/api/evento.service.js
import { api } from './apiClient';

/**
 * Crear un Evento
 * @param {{ nombre: string }} payload
 * @returns {Promise<any>}
 */
export function createEvento(payload) {
  return api.post('/evento', payload);
}

/**
 * Obtener lista de Eventos paginados
 * Permite filtros: nombre, page, size
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getEventos(params) {
  return api.get('/evento', { params });
}

/**
 * Obtener un Evento por ID
 * @param {number} id
 * @returns {Promise<any>}
 */
export function getEventoById(id) {
  return api.get(`/evento/${id}`);
}

/**
 * Actualizar un Evento
 * @param {number} id
 * @param {{ nombre: string }} payload
 * @returns {Promise<any>}
 */
export function updateEvento(id, payload) {
  return api.patch(`/evento/${id}`, payload);
}

/**
 * Eliminar un Evento
 * @param {number} id
 * @returns {Promise<any>}
 */
export function deleteEvento(id) {
  return api.delete(`/evento/${id}`);
}