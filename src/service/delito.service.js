// src/api/delito.service.js
import { api } from './apiClient';

/**
 * Crear delito asignado a un adolescente
 * @param {DelitoDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function createDelito(payload) {
  return api.post('/delito', payload);
}

/**
 * Obtener lista de delitos
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getDelitos(params) {
  return api.get('/delito', { params });
}

/**
 * Obtener un delito por ID
 * @param {number} id
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function getDelito(id) {
  return api.get(`/delito/${id}`);
}

/**
 * Actualizar delito
 * @param {number} id
 * @param {DelitoDto} payload
 * @returns {Promise<import('./snai-dtos').ResultWithData<any>>}
 */
export function updateDelito(id, payload) {
  return api.patch(`/delito/${id}`, payload);
}

/**
 * Eliminar delito por ID
 * @param {number} id
 * @returns {Promise<import('./snai-dtos').SimpleResult>}
 */
export function deleteDelito(id) {
  return api.delete(`/delito/${id}`);
}
