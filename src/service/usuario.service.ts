// src/api/usuario.service.ts
import { api } from './apiClient';
import type {
  PerfilAsignarPayload,
  ResultWithData,
} from './snai-dtos';

export function asignarPerfil(payload: PerfilAsignarPayload) {
  return api.post<ResultWithData<any>>('/usuario/perfil', payload);
}

export function getUsuarios(params?: any) {
  return api.get<any>('/usuario', { params });
}
