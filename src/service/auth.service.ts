// src/api/auth.service.ts
import { api } from './apiClient';
import type {
  LoginPayloadDto,
  RegisterPayloadDto,
  PerfilDto,
  ResultWithData,
} from './snai-dtos';

export function login(payload: LoginPayloadDto) {
  return api.post<ResultWithData<any>>('/auth/login', payload);
}

export function register(payload: RegisterPayloadDto) {
  return api.post<ResultWithData<any>>('/auth/register', payload);
}

export function gainAccess(payload: PerfilDto) {
  return api.post<ResultWithData<any>>('/auth/perfil', payload);
}

export function getProfile() {
  return api.get<ResultWithData<any>>('/auth/profile');
}
