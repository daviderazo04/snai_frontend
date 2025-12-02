// src/api/cantones.service.ts
import { api } from './apiClient';
import type {
  CantonPayload,
  ResultWithData,
} from './snai-dtos';

export function createCanton(payload: CantonPayload) {
  return api.post<ResultWithData<any>>('/cantones', payload);
}

export function getCantones(params?: any) {
  return api.get<any>('/cantones', { params });
}
