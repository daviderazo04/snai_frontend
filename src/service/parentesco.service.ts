// src/api/parentesco.service.ts
import { api } from './apiClient';
import type { ResultWithData } from './snai-dtos';

export function createParentesco(payload: any) {
  return api.post<ResultWithData<any>>('/parentesco', payload);
}

export function getParentescos(params?: any) {
  return api.get<any>('/parentesco', { params });
}
