// src/api/estadoCivil.service.ts
import { api } from './apiClient';
import type { ResultWithData } from './snai-dtos';

export function createEstadoCivil(payload: any) {
  return api.post<ResultWithData<any>>('/estado-civil', payload);
}

export function getEstadosCiviles(params?: any) {
  return api.get<any>('/estado-civil', { params });
}
