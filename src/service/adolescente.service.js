// src/api/adolescente.service.js
import { api } from "./apiClient";

/**
 * Normaliza el payload para cumplir AdolescentePayloadDto:
 * - IDs y "hijos" como number (no string)
 * - hijoPpl y reincide como '0' | '1'
 */
function normalizeAdolescentePayload(payload = {}) {
  const to01 = (v) => {
    if (v === "0" || v === 0 || v === false) return "0";
    if (v === "1" || v === 1 || v === true) return "1";
    return String(v ?? "0");
  };

  return {
    ...payload,
    caiId: Number(payload.caiId),
    nacionalidadId: Number(payload.nacionalidadId),
    estadoCivilId: Number(payload.estadoCivilId),
    gdosId: Number(payload.gdosId),
    etniaId: Number(payload.etniaId),
    cantonId: Number(payload.cantonId),
    hijos: Number(payload.hijos),
    hijoPpl: to01(payload.hijoPpl),
    reincide: to01(payload.reincide),
  };
}

/**
 * Crear un adolescente
 * @param {any} payload
 */
export function createAdolescente(payload) {
  return api.post("/adolescentes", normalizeAdolescentePayload(payload));
}
/**
 * Obtener un Adolescente por ID
 * @param {number} id
 * @returns {Promise<any>}
 */
export function getAdolescenteById(id) {
  return api.get(`/adolescentes/${id}`);
}
/**
 * Obtener lista de adolescentes (paginado)
 * @param {{ nombre?: string, cedula?: string, page?: number, size?: number }} [params]
 */
export function getAdolescentes(params = {}) {
  const clean = {};

  if (params.nombre) clean.nombre = params.nombre;
  if (params.cedula) clean.cedula = params.cedula;
  if (params.page != null) clean.page = Number(params.page);
  if (params.size != null) clean.size = Number(params.size);

  return api.get("/adolescentes", { params: clean });
}

/**
 * Actualizar un adolescente por id
 * @param {number|string} id
 * @param {any} payload
 */
export function updateAdolescente(id, payload) {
  return api.patch(`/adolescentes/${id}`, normalizeAdolescentePayload(payload));
}

/**
 * Eliminar (soft delete) un adolescente por id
 * @param {number|string} id
 */
export function deleteAdolescente(id) {
  return api.delete(`/adolescentes/${id}`);
}
