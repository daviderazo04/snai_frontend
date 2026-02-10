import { api } from './apiClient';

/**
 * Crear un registro jurídico
 * POST /juridico
 *
 * @param {Object} payload
 * @param {number} payload.adolescenteId
 * @param {number} payload.delitoId
 * @param {string} payload.numeroCausa
 * @param {string} payload.juez
 * @param {string} payload.defensor
 * @param {string} payload.fiscal
 * @param {string} payload.medidas
 * @param {string} payload.boletaPreventivo
 * @param {string} payload.fechaInicio        YYYY-MM-DD
 * @param {string} payload.fechaAudiencia     YYYY-MM-DD
 * @param {string} payload.boletaCarcel
 * @param {string} payload.fechaSentencia     YYYY-MM-DD
 * @param {number} payload.tiempoAnio
 * @param {number} payload.tiempoMes
 * @param {number} payload.sentenciaDia
 * @param {string} payload.fechaFin           YYYY-MM-DD
 * @param {string} payload.fecha60            YYYY-MM-DD
 * @param {string} payload.fecha80            YYYY-MM-DD
 * @param {string} payload.recApelMod
 * @param {string} payload.RecApelFecha        YYYY-MM-DD | ISO
 * @param {string} payload.casacionRecurso
 * @param {string} payload.casacionFecha       YYYY-MM-DD | ISO
 * @param {string} payload.egresoFecha         YYYY-MM-DD | ISO
 * @param {string} payload.egresoMotivo
 */
export function createJuridico(payload) {
  return api.post('/juridico', payload);
}

/**
 * Listar registros jurídicos paginados
 * GET /juridico
 *
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.size
 * @param {string} [params.termino]        Búsqueda por numeroCausa
 * @param {number} [params.adolescenteId]
 * @param {number} [params.delitoId]
 */
export function getJuridicos(params) {
  return api.get('/juridico', { params });
}

/**
 * Obtener un registro jurídico por ID
 * GET /juridico/{id}
 *
 * @param {number} id
 */
export function getJuridico(id) {
  return api.get(`/juridico/${id}`);
}

/**
 * Actualizar un registro jurídico
 * PUT /juridico/{id}
 *
 * @param {number} id
 * @param {Object} payload
 * (misma estructura que createJuridico)
 */
export function updateJuridico(id, payload) {
  return api.put(`/juridico/${id}`, payload);
}

/**
 * Eliminar un registro jurídico
 * DELETE /juridico/{id}
 *
 * @param {number} id
 */
export function deleteJuridico(id) {
  return api.delete(`/juridico/${id}`);
}
