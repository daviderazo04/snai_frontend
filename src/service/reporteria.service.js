// src/service/reporteria.service.js
import { api } from "./apiClient";

// ==========================================
// REPORTERÍA
// Base path: /reporteria
// ==========================================

/**
 * Reporte Demográfico: Etnia (ReportResult)
 * GET /reporteria/demografico/etnia
 */
export const getReporteDemograficoEtnia = () => {
  return api.get("/reporteria/demografico/etnia");
};

/**
 * Reporte Matriz: Nacionalidad por CAI (ReportMatrixResult)
 * GET /reporteria/matriz/nacionalidad
 */
export const getReporteMatrizNacionalidadPorCai = () => {
  return api.get("/reporteria/matriz/nacionalidad");
};

/**
 * Reporte Matriz: Edad por CAI (ReportMatrixResult)
 * GET /reporteria/matriz/edad
 */
export const getReporteMatrizEdadPorCai = () => {
  return api.get("/reporteria/matriz/edad");
};

/**
 * Reporte Matriz: Infracción/Delito por CAI (ReportMatrixResult)
 * GET /reporteria/matriz/infraccion
 */
export const getReporteMatrizInfraccionPorCai = () => {
  return api.get("/reporteria/matriz/infraccion");
};

/**
 * Reporte Matriz: Medidas por CAI (ReportMatrixResult)
 * GET /reporteria/matriz/medidas
 */
export const getReporteMatrizMedidasPorCai = () => {
  return api.get("/reporteria/matriz/medidas");
};

// (Opcional) export default para importarlo como objeto
export default {
  getReporteDemograficoEtnia,
  getReporteMatrizNacionalidadPorCai,
  getReporteMatrizEdadPorCai,
  getReporteMatrizInfraccionPorCai,
  getReporteMatrizMedidasPorCai,
};
