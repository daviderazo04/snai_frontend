import { api } from "./apiClient";

const normalizeDate = (value) => {
  if (!value) return null;
  return String(value).slice(0, 10);
};

const normalizePayload = (payload = {}) => ({
  adolescenteId: Number(payload.adolescenteId),
  representanteId: Number(payload.representanteId),
  fechaInicio: normalizeDate(payload.fechaInicio),
  fechaFin: normalizeDate(payload.fechaFin),
});

/**
 * Crear vínculo entre representante y adolescente.
 * @param {{ adolescenteId: number, representanteId: number, fechaInicio: string, fechaFin: string }} payload
 */
export function createRepInfractor(payload) {
  return api.post("/rep-infractores", normalizePayload(payload));
}

/**
 * Obtener vínculos paginados.
 * Filtros: adolescenteId, representanteId, page, size
 * @param {{ adolescenteId?: number, representanteId?: number, page?: number, size?: number }} [params]
 */
export function getRepInfractores(params = {}) {
  const clean = {
    page: Number(params.page ?? 1),
    size: Number(params.size ?? 10),
  };

  if (params.adolescenteId != null && params.adolescenteId !== "") {
    clean.adolescenteId = Number(params.adolescenteId);
  }
  if (params.representanteId != null && params.representanteId !== "") {
    clean.representanteId = Number(params.representanteId);
  }

  return api.get("/rep-infractores", { params: clean });
}

/**
 * Actualizar vínculo.
 * @param {number|string} id
 * @param {{ adolescenteId: number, representanteId: number, fechaInicio: string, fechaFin: string }} payload
 */
export function updateRepInfractor(id, payload) {
  return api.patch(`/rep-infractores/${id}`, normalizePayload(payload));
}

/**
 * Eliminar vínculo.
 * @param {number|string} id
 */
export function deleteRepInfractor(id) {
  return api.delete(`/rep-infractores/${id}`);
}
