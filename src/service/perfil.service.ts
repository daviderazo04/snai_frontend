// src/api/perfil.service.ts
import { api } from './apiClient';
import type {
  PerfilPayloadDto,
  PerfilUpdatePayloadDto,
  ResultWithData,
} from './snai-dtos';

export function createPerfil(payload: PerfilPayloadDto) {
  return api.post<ResultWithData<any>>('/perfil', payload);
}

export function updatePerfil(id: number, payload: PerfilUpdatePayloadDto) {
  return api.put<ResultWithData<any>>(`/perfil/${id}`, payload);
}

export function getPerfiles(params?: any) {
  return api.get<any>('/perfil', { params });
}
