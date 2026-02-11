// src/api/ocupacion.service.js
import { api } from './apiClient';

function normalizePayload(payload = {}) {
  return {
    ...payload,
    adolescenteId: payload.adolescenteId != null ? Number(payload.adolescenteId) : undefined,
    participacion: payload.participacion ? Number(payload.participacion) : 0,
    fecha: payload.fecha ? String(payload.fecha) : undefined,
    taller: payload.taller?.trim(),
    instructor: payload.instructor?.trim(),
    observacion: payload.observacion?.trim(),
  };
}

export function createOcupacion(payload) {
  return api.post('/ocupacion', normalizePayload(payload));
}

export function getOcupaciones(params) {
  return api.get('/ocupacion', { params });
}

export function getOcupacionById(id) {
  return api.get(`/ocupacion/${id}`);
}

export function updateOcupacion(id, payload) {
  return api.patch(`/ocupacion/${id}`, normalizePayload(payload));
}

export function deleteOcupacion(id) {
  return api.delete(`/ocupacion/${id}`);
}
