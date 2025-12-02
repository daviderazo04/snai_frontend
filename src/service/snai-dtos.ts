// Auto-generated frontend DTO interfaces based on backend NestJS DTOs
// You can put this file in e.g. src/api/snai-dtos.ts

export interface AdolescentePayloadDto {
  caiId: number;
  nacionalidadId: number;
  estadoCivilId: number;
  gdosId: number;
  etniaId: number;
  cantonId: number;
  nombre: string;
  apellido: string;
  fecha_nac: string;
  hijos: number;
  fecha_ingr: string;
  cedula: string;
  hijoPpl: string;
  reincide: string;
  observaciones: string;
}

export interface RepInfractorPayloadDto {
  adolescenteId: number;
  nombre: string;
  apellido: string;
  cedula: string;
  direccion: string;
  telefono: string;
}

export interface RepresentantePayloadDto {
  adolescenteId: number;
  nombre: string;
  apellido: string;
  cedula: string;
  direccion: string;
  telefono: string;
  tipoParentescoId: number;
}

export interface LoginPayloadDto {
  correo: string;
  password: string;
}

export interface PerfilDto {
  perfilId: number;
}

export interface RegisterPayloadDto {
  correo: string;
  password: string;
  nombre: string;
  apellido: string;
  cedula: string;
  direccion: string;
  telefono: string;
  sexo: any; // Sexo enum on backend; ajusta si quieres replicar el enum
}

export interface PaginatedResult<T> {
  data: T[];
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface ResultWithData<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SimpleResult {
  success: boolean;
  message: string;
}

export interface DelitoDto {
  adolescenteId: number;
  delitoId: number;
  fechaHecho: string;
  descripcion: string;
}

export interface CreateJuridicoDto {
  adolescenteId: number;
  fiscalia: string;
  juez: string;
  causa: string;
  situacionJuridica: string;
  observaciones: string;
}

export interface CreateOcupacionDto {
  adolescenteId: number;
  ocupacion: string;
  lugarTrabajo: string;
  ingresos: number;
}

export interface CaiPayloadDto {
  nombre: string;
  cantonId: number;
}

export interface CantonPayload {
  nombre: string;
  provinciaId: number;
}

export interface ProvinciaPayloadDto {
  nombre: string;
}

export interface PerfilAsignarPayload {
  usuarioId: number;
  perfilId: number;
}

export interface PerfilPayloadDto {
  nombre: string;
  descripcion: string;
  permisos: PermisoDto[];
}

export interface PermisoDto {
  endpoint: string;
  VIEW: boolean;
  EDIT: boolean;
}

export interface PerfilUpdatePayloadDto {
  nombre: string;
  descripcion: string;
  permisosEditados: PermisoDto[];
}
