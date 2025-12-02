// src/api/nacionalidad.service.ts
import { api } from './apiClient';
import type { ResultWithData } from './snai-dtos';

export function createNacionalidad(payload: any) {
  return api.post<ResultWithData<any>>('/nacionalidad', payload);
}

export function getNacionalidades(params?: any) {
  return api.get<any>('/nacionalidad', { params });
}
