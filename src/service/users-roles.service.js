import { api } from './apiClient';

// ==========================================
// 1. USUARIOS
// ==========================================

/**
 * Listar usuarios paginados
 * @param {Object} params { nombre, page, size }
 */
export function getUsuarios(params = {}) {
  return api.get('/usuario', { params });
}

/**
 * Registrar nuevo usuario (Auth Controller)
 * @param {Object} payload RegisterPayloadDto
 */
export function register(payload) {
  return api.post('/auth/register', payload);
}

/**
 * Asignar roles a un usuario
 * @param {number} userId 
 * @param {number[]} roleIds 
 */
export function asignarPerfilUsuario(userId, roleIds) {
  return api.post(`/usuario/perfil/${userId}`, { perfiles: roleIds });
}

// ==========================================
// 2. PERFILES (ROLES)
// ==========================================

export function getPerfiles(params = {}) {
  return api.get('/perfil', { params });
}

export function createPerfil(payload) {
  return api.post('/perfil', payload);
}

export function updatePerfil(id, payload) {
  return api.patch(`/perfil/${id}`, payload);
}

/**
 * [NUEVO] Obtener permisos configurados de un perfil específico
 * Endpoint: GET /perfil/:id/permisos
 */
export function getPermisosPorPerfil(id) {
  return api.get(`/perfil/${id}/permisos`);
}

// ==========================================
// 3. RECURSOS (ENDPOINTS / PERMISOS)
// ==========================================

/**
 * Obtener todos los endpoints del sistema (para matriz de permisos)
 */
export function getSystemEndpoints() {
  return api.get('/endpoints');
}