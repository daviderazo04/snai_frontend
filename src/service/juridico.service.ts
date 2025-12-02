// src/api/juridico.service.ts
import { api } from './apiClient';
import type {
  CreateJuridicoDto,
  ResultWithData,
  SimpleResult,
} from './snai-dtos';

export function createJuridico(payload: CreateJuridicoDto) {
  return api.post<ResultWithData<any>>('/juridico', payload);
}

export function getJuridicos(params?: any) {
  return api.get<any>('/juridico', { params });
}

export function getJuridico(id: number) {
  return api.get<ResultWithData<any>>(`/juridico/${id}`);
}

export function updateJuridico(id: number, payload: CreateJuridicoDto) {
  return api.patch<ResultWithData<any>>(`/juridico/${id}`, payload);
}

export function deleteJuridico(id: number) {
  return api.delete<SimpleResult>(`/juridico/${id}`);
}
