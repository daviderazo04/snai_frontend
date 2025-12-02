// src/api/provincias.service.ts
import { api } from './apiClient';
import type {
  ProvinciaPayloadDto,
  ResultWithData,
} from './snai-dtos';

export function createProvincia(payload: ProvinciaPayloadDto) {
  return api.post<ResultWithData<any>>('/provincias', payload);
}

export function getProvincias(params?: any) {
  return api.get<any>('/provincias', { params });
}
