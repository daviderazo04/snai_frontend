// src/api/traslados.service.js
import { api } from "./apiClient";

/**
 * Crear un traslado
 * @param {{ caiId: number, adolescenteId: number, fecha: string, observaciones?: string }} payload
 * @returns {Promise<any>}
 */
export function createTraslado(payload) {
  return api.post("/traslados", payload);
}

/**
 * Obtener lista de traslados
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getTraslados(params) {
  return api.get("/traslados", { params });
}

/**
 * Actualizar un traslado
 * @param {number|string} id
 * @param {{ caiId: number, fecha: string, observaciones?: string }} payload
 * @returns {Promise<any>}
 */
export function updateTraslado(id, payload) {
  return api.patch(`/traslados/${id}`, payload);
}

/**
 * Eliminar un traslado
 * @param {number|string} id
 * @returns {Promise<any>}
 */
export function deleteTraslado(id) {
  return api.delete(`/traslados/${id}`);
}
