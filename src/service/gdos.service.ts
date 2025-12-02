// src/api/gdos.service.ts
import { api } from './apiClient';
import type { ResultWithData } from './snai-dtos';

export function createGdos(payload: any) {
  return api.post<ResultWithData<any>>('/gdos', payload);
}

export function getGdos(params?: any) {
  return api.get<any>('/gdos', { params });
}
