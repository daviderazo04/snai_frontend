// src/api/educacion.service.js
import { api } from "./apiClient";

/**
 * Crear un registro educativo
 * @param {any} payload
 * @returns {Promise<any>}
 */
export function createEducacion(payload) {
  return api.post("/educacion", payload);
}

/**
 * Obtener lista de educación
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getEducaciones(params) {
  return api.get("/educacion", { params });
}

/**
 * Actualizar un registro educativo
 * @param {number|string} id
 * @param {any} payload
 * @returns {Promise<any>}
 */
export function updateEducacion(id, payload) {
  return api.patch(`/educacion/${id}`, payload);
}

/**
 * Eliminar un registro educativo
 * @param {number|string} id
 * @returns {Promise<any>}
 */
export function deleteEducacion(id) {
  return api.delete(`/educacion/${id}`);
}
