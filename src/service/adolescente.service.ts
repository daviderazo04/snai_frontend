// src/api/adolescente.service.ts
import { api } from './apiClient';
import type {
  AdolescentePayloadDto,
  PaginatedResult,
  ResultWithData,
} from './snai-dtos';

export function createAdolescente(payload: AdolescentePayloadDto) {
  return api.post<ResultWithData<any>>('/adolescentes', payload);
}

export function getAdolescentes(params?: {
  nombre?: string;
  cedula?: string;
  page?: number;
  size?: number;
}) {
  return api.get<PaginatedResult<any>>('/adolescentes', { params });
}
