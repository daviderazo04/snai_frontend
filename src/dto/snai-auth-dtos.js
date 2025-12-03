// ====================================================================
// AUTH — DEFINICIÓN COMPLETA DE TODOS LOS DTOS QUE SE ESPERAN Y RETORNAN
// ====================================================================


/**
 * ==========================================================
 *  LOGIN PAYLOAD (Lo que ESPERA el backend)
 * ==========================================================
 * POST /auth/login
 *
 * El backend espera este JSON:
 * {
 *   "correo": "usuario@correo.com",
 *   "password": "123456"
 * }
 */
export /**
 * @typedef {Object} LoginPayloadDto
 * @property {string} correo - Correo del usuario
 * @property {string} password - Contraseña del usuario
 */ {};



/**
 * ==========================================================
 *  LOGIN RESPONSE (Lo que RETORNA el backend)
 * ==========================================================
 * Respuesta correcta del login:
 *
 * {
 *   "success": true,
 *   "message": "Login exitoso",
 *   "data": {
 *     "accessToken": "JWT_TOKEN",
 *     "user": { ...JwtUser },
 *     "posiblesPerfiles": [ ...PerfilItem[] ]
 *   }
 * }
 */
export /**
 * @typedef {Object} LoginResponseDto
 * @property {boolean} success
 * @property {string} message
 * @property {LoginResponseData} data
 */ {};



/**
 * Datos dentro de "data" en el login.
 */
export /**
 * @typedef {Object} LoginResponseData
 * @property {string} accessToken - JWT asignado al usuario
 * @property {JwtUser} user - Información del usuario
 * @property {PerfilItem[]} posiblesPerfiles - Perfiles disponibles
 */ {};



/**
 * ==========================================================
 *  PERFIL (Lo que RETORNA el backend en login)
 * ==========================================================
 *
 * Estructura de cada perfil mostrado en posiblesPerfiles:
 *
 * {
 *    "id": 16,
 *    "nombre": "Administrador"
 * }
 */
export /**
 * @typedef {Object} PerfilItem
 * @property {number} id - ID del perfil
 * @property {string} nombre - Nombre del perfil
 */ {};



/**
 * ==========================================================
 *  JWT_USER (Lo que RETORNA el backend en /auth/profile
 *            y en /auth/perfil)
 * ==========================================================
 *
 * Ejemplo:
 * {
 *   "id": 8,
 *   "correo": "perfil.e2e@example.com",
 *   "nombre": "Perfil",
 *   "apellido": "E2E",
 *   "perfilActivo": {
 *       "id": 16,
 *       "nombre": "Administrador"
 *   }
 * }
 */
export /**
 * @typedef {Object} JwtUser
 * @property {number} id
 * @property {string} correo
 * @property {string} nombre
 * @property {string} apellido
 * @property {PerfilItem|null} perfilActivo - Perfil actualmente seleccionado
 */ {};



/**
 * ==========================================================
 *  PAYLOAD PARA SELECCIONAR PERFIL (Lo que ESPERA el backend)
 * ==========================================================
 * POST /auth/perfil
 *
 * Según Swagger, el backend espera:
 *
 * {
 *   "id": 16,
 *   "nombre": "Administrador"
 * }
 *
 * NO espera "perfilId".
 * NO espera "perfil".
 * NO espera "perfil_id".
 */
export /**
 * @typedef {Object} PerfilSelectPayload
 * @property {number} id - ID del perfil seleccionado
 * @property {string} nombre - Nombre del perfil seleccionado
 */ {};



/**
 * ==========================================================
 *  RESPUESTA DE /auth/perfil (Lo que RETORNA el backend)
 * ==========================================================
 *
 * Ejemplo:
 * {
 *   "success": true,
 *   "message": "Perfil asignado correctamente",
 *   "data": {
 *       "id": 8,
 *       "correo": "perfil.e2e@example.com",
 *       "nombre": "Perfil",
 *       "apellido": "E2E",
 *       "perfilActivo": {
 *           "id": 16,
 *           "nombre": "Administrador"
 *       }
 *   }
 * }
 */
export /**
 * @typedef {Object} PerfilSelectResponse
 * @property {boolean} success
 * @property {string} message
 * @property {JwtUser} data
 */ {};



/**
 * ==========================================================
 *  REGISTER PAYLOAD (Lo que ESPERA el backend)
 * ==========================================================
 * POST /auth/register
 *
 * {
 *   "correo": "nuevo@user.com",
 *   "password": "123456",
 *   "nombre": "Juan",
 *   "apellido": "Soto",
 *   "cedula": "0102030405",
 *   "direccion": "Mi calle",
 *   "telefono": "0987654321",
 *   "sexo": "M" // depende del enum
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
 * @property {*} sexo
 */ {};



// Export vacío para permitir importación
export const AUTH_DTO = {};
