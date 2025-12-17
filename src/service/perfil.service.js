// ====================================================================
// SNAI DTOS — AUTH + PERFIL + USUARIO (Payloads & Responses)
// ====================================================================

/**
 * =========================
 * ESTRUCTURA BASE DE RESPUESTA
 * =========================
 * Muchos endpoints retornan:
 * { success: boolean, message: string, data: ... }
 */
export /**
 * @template T
 * @typedef {Object} ResultWithData
 * @property {boolean} success
 * @property {string} message
 * @property {T} data
 */ {};

// ====================================================================
// AUTH
// ====================================================================

/**
 * POST /auth/login
 * Body esperado:
 * { "correo": "...", "password": "..." }
 */
export /**
 * @typedef {Object} LoginPayloadDto
 * @property {string} correo
 * @property {string} password
 */ {};

/**
 * Item de perfil mostrado en login.posiblesPerfiles
 * { "id": 16, "nombre": "Administrador" }
 */
export /**
 * @typedef {Object} PerfilItem
 * @property {number} id
 * @property {string} nombre
 */ {};

/**
 * Usuario retornado en /auth/profile y dentro del login
 */
export /**
 * @typedef {Object} JwtUser
 * @property {number} id
 * @property {string} correo
 * @property {string} nombre
 * @property {string} apellido
 * @property {PerfilItem|null} perfilActivo
 */ {};

/**
 * Data dentro del login
 */
export /**
 * @typedef {Object} LoginResponseData
 * @property {string} accessToken
 * @property {JwtUser} user
 * @property {PerfilItem[]} posiblesPerfiles
 */ {};

/**
 * Respuesta completa de login
 */
export /**
 * @typedef {ResultWithData<LoginResponseData>} LoginResponseDto
 */ {};

/**
 * POST /auth/perfil
 * Body esperado (según Swagger/backend):
 * { "id": 16, "nombre": "Administrador" }
 */
export /**
 * @typedef {Object} PerfilSelectPayload
 * @property {number} id
 * @property {string} nombre
 */ {};

/**
 * Respuesta de /auth/perfil
 */
export /**
 * @typedef {ResultWithData<JwtUser>} PerfilSelectResponse
 */ {};

/**
 * POST /auth/register
 * Body esperado:
 * {
 *  correo, password, nombre, apellido, cedula,
 *  direccion, telefono, sexo
 * }
 */
export /**
 * @typedef {Object} RegisterPayloadDto
 * @property {string} correo
 * @property {string} password
 * @property {string} nombre
 * @property {string} apellido
 * @property {string} cedula
 * @property {string} direccion
 * @property {string} telefono
 * @property {string} sexo
 */ {};

// ====================================================================
// PERFIL + PERMISOS + ENDPOINTS
// ====================================================================

/**
 * Estructura plana de endpoint (según EndpointFlatResponseDto)
 * Nota: los campos exactos pueden variar; ajusta si tu backend tiene más.
 */
export /**
 * @typedef {Object} EndpointFlatResponseDto
 * @property {number} id
 * @property {string} ruta
 * @property {string} metodo
 * @property {string} descripcion
 */ {};

/**
 * Permiso plano (según PermisoFlatResponseDto)
 */
export /**
 * @typedef {Object} PermisoFlatResponseDto
 * @property {number} id
 * @property {boolean} VIEW
 * @property {boolean} EDIT
 * @property {EndpointFlatResponseDto} endpoint
 */ {};

/**
 * DTO interno de permisos que envías al backend al crear/editar perfil.
 * (Basado en tu PerfilPayloadDto / PerfilUpdatePayloadDto: contiene endpoint + flags)
 *
 * IMPORTANTE: en backend se usa endpointId para mapear el permiso.
 */
export /**
 * @typedef {Object} PermisoDto
 * @property {number} endpointId
 * @property {boolean} VIEW
 * @property {boolean} EDIT
 */ {};

/**
 * POST /perfil
 * Crear perfil + permisos iniciales
 */
export /**
 * @typedef {Object} PerfilPayloadDto
 * @property {string} nombre
 * @property {PermisoDto[]} permisos
 */ {};

/**
 * PUT /perfil/:id
 * Actualización de perfil. En tu backend el nombre del array es "permisosEditados".
 */
export /**
 * @typedef {Object} PerfilUpdatePayloadDto
 * @property {string} [nombre]
 * @property {PermisoDto[]} [permisosEditados]
 */ {};

/**
 * DTO de Perfil para listados / respuestas (genérico)
 * Ajusta campos si tu backend retorna más.
 */
export /**
 * @typedef {Object} PerfilResponseDto
 * @property {number} id
 * @property {string} nombre
 */ {};

// ====================================================================
// USUARIO
// ====================================================================

/**
 * Item de usuario para listados (según select de usuario.service.ts)
 */
export /**
 * @typedef {Object} UsuarioListItem
 * @property {number} id
 * @property {string} nombre
 * @property {string} apellido
 * @property {string} correo
 * @property {string} estado
 * @property {string} createdAt
 * @property {string} updatedAt
 */ {};

/**
 * Respuesta paginada (tu backend usa PaginatedResult)
 * Nota: si tu PaginatedResult tiene otros nombres, ajusta aquí.
 */
export /**
 * @template T
 * @typedef {Object} PaginatedResult
 * @property {T[]} items
 * @property {number} totalPages
 * @property {number} page
 * @property {number} size
 */ {};

/**
 * GET /usuario
 * Respuesta esperada (paginada)
 */
export /**
 * @typedef {ResultWithData<PaginatedResult<UsuarioListItem>>} UsuariosPaginatedResponse
 */ {};

/**
 * Asignar perfiles a usuario
 *
 * Backend hoy está inconsistente (ruta sin :id pero lee Param('id')).
 * Te dejo ambos payloads posibles para alinear:
 */

/**
 * Payload si usas POST /usuario/:id/perfil
 * Body: { perfiles: [1,2,3] }
 */
export /**
 * @typedef {Object} PerfilAsignarPayload
 * @property {number[]} perfiles
 */ {};

/**
 * Payload alternativo si mantienes POST /usuario/perfil (sin :id en ruta)
 * Body: { usuarioId: 8, perfiles: [1,2,3] }
 */
export /**
 * @typedef {Object} PerfilAsignarPayloadWithUserId
 * @property {number} usuarioId
 * @property {number[]} perfiles
 */ {};

// Export vacío para permitir importación
export const SNAI_DTOS = {};
