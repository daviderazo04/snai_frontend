import { api } from './apiClient';

// ==========================================
// 1. USUARIOS
// ==========================================

/**
 * Listar usuarios paginados (Sanitizados)
 * @param {Object} params { nombre, page, size }
 */
export function getUsuarios(params = { nombre: '', page: 1, size: 10 }) {
  return api.get('/usuario', { params });
}

/**
 * Registrar nuevo usuario (Se asume implementación en AuthService)
 * @param {Object} payload RegisterPayloadDto
 */
export function register(payload) {
  return api.post('/auth/register', payload);
}

/**
 * Asignar roles a un usuario
 * @param {number} userId 
 * @param {number[]} roleIds - Arreglo de IDs de perfiles
 */
export function asignarPerfilUsuario(userId, roleIds) {
  // El payload esperado es { perfiles: number[] } según PerfilAsignarPayload
  return api.post(`/usuario/perfil/${userId}`, { perfiles: roleIds });
}

/**
 * Obtener detalle completo de un usuario (incluye perfiles y permisos aplanados)
 * @param {number} id 
 */
export function getDetalleUsuario(id) {
  return api.get(`/usuario/detalle/${id}`);
}

// ==========================================
// 2. PERFILES (ROLES)
// ==========================================

/**
 * Listar perfiles paginados
 */
export function getPerfiles(params = { nombre: '', page: 1, size: 10 }) {
  return api.get('/perfil', { params });
}

/**
 * Crear perfil con su lista de permisos inicial
 * @param {Object} payload PerfilPayloadDto { nombre, descripcion, permisos: PermisoDto[] }
 */
export function createPerfil(payload) {
  return api.post('/perfil', payload);
}

/**
 * Editar perfil (Nombre, descripción y/o permisos)
 * @param {number} id 
 * @param {Object} payload PerfilUpdatePayloadDto { nombre, descripcion, permisosEditados: PermisoDto[] }
 */
export function updatePerfil(id, payload) {
  // Nota: El DTO espera "permisosEditados" para la lista de permisos
  return api.patch(`/perfil/${id}`, payload);
}

/**
 * Obtener permisos y detalles de un perfil específico
 * CORRECCIÓN: El endpoint correcto es /perfil/detalle/:id según PerfilController
 */
export function getDetallePerfil(id) {
  return api.get(`/perfil/detalle/${id}`);
}

// ==========================================
// 3. RECURSOS (ENDPOINTS / PERMISOS)
// ==========================================

/**
 * Obtener todos los endpoints disponibles en el sistema (aplanados)
 * Útil para la matriz de permisos al crear o editar perfiles.
 */
export function getSystemEndpoints() {
  return api.get('/endpoints');
}