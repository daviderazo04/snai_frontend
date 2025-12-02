// src/api/cai.service.ts
import { api } from './apiClient';
import type {
  CaiPayloadDto,
  ResultWithData,
} from './snai-dtos';

export function createCai(payload: CaiPayloadDto) {
  return api.post<ResultWithData<any>>('/cai', payload);
}

export function getCais(params?: any) {
  return api.get<any>('/cai', { params });
}
