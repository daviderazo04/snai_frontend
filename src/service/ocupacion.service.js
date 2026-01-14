// src/api/ocupacion.service.js
import { api } from './apiClient';

/**
 * Función auxiliar para asegurar tipos de datos antes de enviar
 */
function normalizePayload(payload) {
  return {
    ...payload,
    // Aseguramos que sea número (si viene null o string vacío, enviamos null o undefined según convenga, 
    // pero tu DTO requiere número, así que Number() está bien si el form valida que no sea nulo)
    adolescenteId: Number(payload.adolescenteId),
    participacion: payload.participacion ? Number(payload.participacion) : 0,
    // La fecha ya suele ir bien como YYYY-MM-DD, pero aseguramos que sea string
    fecha: String(payload.fecha), 
    // Limpiamos espacios en blanco de textos
    taller: payload.taller?.trim(),
    instructor: payload.instructor?.trim(),
    observacion: payload.observacion?.trim(),
  };
}

export function createOcupacion(payload) {
  // Aplicamos la normalización antes de enviar
  return api.post('/ocupacion', normalizePayload(payload));
}

export function getOcupaciones(params) {
  return api.get('/ocupacion', { params });
}

export function getOcupacionById(id) {
  return api.get(`/ocupacion/${id}`);
}

export function updateOcupacion(id, payload) {
  // Aplicamos la normalización antes de enviar
  return api.patch(`/ocupacion/${id}`, normalizePayload(payload));
}