// src/api/delito.service.ts
import { api } from './apiClient';
import type {
  DelitoDto,
  ResultWithData,
  SimpleResult,
} from './snai-dtos';

export function createDelito(payload: DelitoDto) {
  return api.post<ResultWithData<any>>('/delito', payload);
}

export function getDelitos(params?: any) {
  return api.get<any>('/delito', { params });
}

export function getDelito(id: number) {
  return api.get<ResultWithData<any>>(`/delito/${id}`);
}

export function updateDelito(id: number, payload: DelitoDto) {
  return api.patch<ResultWithData<any>>(`/delito/${id}`, payload);
}

export function deleteDelito(id: number) {
  return api.delete<SimpleResult>(`/delito/${id}`);
}
