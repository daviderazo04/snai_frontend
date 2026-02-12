import { api } from "./apiClient";

/**
 * Crear representante
 * @param {{
 *   nacionalidadId: number,
 *   parentescoId: number,
 *   cantonId: number,
 *   nombre: string,
 *   apellido: string,
 *   cedula: string
 * }} payload
 * @returns {Promise<any>}
 */
export function createRepresentante(payload) {
  return api.post("/representantes", payload);
}

/**
 * Obtener representantes paginados
 * Filtros: nombre, cedula, page, size
 * @param {any} [params]
 * @returns {Promise<any>}
 */
export function getRepresentantes(params) {
  return api.get("/representantes", { params });
}

/**
 * Actualizar representante
 * @param {number|string} id
 * @param {{
 *   nacionalidadId: number,
 *   parentescoId: number,
 *   cantonId: number,
 *   nombre: string,
 *   apellido: string,
 *   cedula: string
 * }} payload
 * @returns {Promise<any>}
 */
export function updateRepresentante(id, payload) {
  return api.patch(`/representantes/${id}`, payload);
}

/**
 * Eliminar representante
 * @param {number|string} id
 * @returns {Promise<any>}
 */
export function deleteRepresentante(id) {
  return api.delete(`/representantes/${id}`);
}
