// src/api/etnia.service.ts
import { api } from './apiClient';
import type { ResultWithData } from './snai-dtos';

export function createEtnia(payload: any) {
  return api.post<ResultWithData<any>>('/etnia', payload);
}

export function getEtnias(params?: any) {
  return api.get<any>('/etnia', { params });
}
