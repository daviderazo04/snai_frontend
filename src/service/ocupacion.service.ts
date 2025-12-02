// src/api/ocupacion.service.ts
import { api } from './apiClient';
import type {
  CreateOcupacionDto,
  ResultWithData,
  SimpleResult,
} from './snai-dtos';

export function createOcupacion(payload: CreateOcupacionDto) {
  return api.post<ResultWithData<any>>('/ocupacion', payload);
}

export function getOcupaciones(params?: any) {
  return api.get<any>('/ocupacion', { params });
}

export function getOcupacion(id: number) {
  return api.get<ResultWithData<any>>(`/ocupacion/${id}`);
}

export function updateOcupacion(id: number, payload: CreateOcupacionDto) {
  return api.patch<ResultWithData<any>>(`/ocupacion/${id}`, payload);
}

export function deleteOcupacion(id: number) {
  return api.delete<SimpleResult>(`/ocupacion/${id}`);
}
