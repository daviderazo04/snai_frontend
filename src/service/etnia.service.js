import { api } from './apiClient';

// Crear
export function createEtnia(payload) {
  return api.post('/etnia', payload);
}

// Listar
export function getEtnias(params) {
  return api.get('/etnia', { params });
}

// Obtener por ID
export function getEtniaById(id) {
  return api.get(`/etnia/${id}`);
}

// Actualizar
export function updateEtnia(id, payload) {
  return api.put(`/etnia/${id}`, payload);
}

// Eliminar
export function deleteEtnia(id) {
  return api.delete(`/etnia/${id}`);
}
