<template>
  <div class="salud-page">
    
    <section class="hero">
      <div class="hero-content">
        
        <div class="hero-header">
          <p class="page-subtitle">CATÁLOGOS</p>
          <h1 class="page-title">Reportería CAI</h1>
          <p class="page-description">Consulta de métricas demográficas y operativas por centro.</p>
        </div>

        <div class="hero-stats">
          
          <div class="stat-card">
            <span class="label">REPORTE ACTUAL</span>
            <strong class="stat-value">{{ selectedReportLabel }}</strong>
          </div>

          <div class="stat-card">
            <span class="label">TOTAL NACIONAL</span>
            <strong class="stat-value">{{ totalCount }}</strong>
            <span class="hint">Adolescentes / Casos</span>
          </div>

        </div>
        
      </div>
    </section>

    <section class="panel">
      
      <div v-if="availableReports.length === 0" class="status error">
        <h3>Acceso Restringido</h3>
        <p>No tienes permisos asignados para visualizar los reportes.</p>
      </div>

      <template v-else>
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="control-group">
              <label class="control-label">Seleccionar Reporte</label>
              <div class="select-wrapper">
                <select v-model="selectedReportKey" class="control-input" @change="handleReportChange">
                  <option v-for="r in availableReports" :key="r.key" :value="r.key">
                    {{ r.label }}
                  </option>
                </select>
              </div>
            </div>

            <button class="btn-primary" @click="reload" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-sm"></span>
              {{ isLoading ? "Cargando..." : "Actualizar" }}
            </button>
          </div>

          <div class="toolbar-right">
            <div class="search-wrap">
              <span class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                v-model="search"
                class="search-input"
                type="text"
                placeholder="Filtrar datos..."
              />
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="status loading">
          <div class="spinner-lg"></div>
          <p>Procesando matriz de datos...</p>
        </div>

        <div v-else-if="errorMessage" class="status error">
          <p>{{ errorMessage }}</p>
          <button class="btn-outline" @click="reload">Intentar nuevamente</button>
        </div>

        <div v-else class="report-container">
          <div class="report-header-internal">
            <h4>{{ reportData.titulo || selectedReportLabel }}</h4>
            <span class="badge">{{ totalCount }} Registros</span>
          </div>

          <div class="pivot-card">
            <div class="pivot-scroll-container">
              <table class="pivot-table">
                <thead>
                  <tr>
                    <th class="sticky-corner">
                      <div class="corner-content">
                        <span>Concepto 👇</span>
                        <span>CAI 👉</span>
                      </div>
                    </th>
                    <th v-for="y in axisY" :key="y" class="col-header">
                      {{ y }}
                    </th>
                    <th class="col-header header-total">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="x in axisX" :key="x">
                    <td class="row-header sticky-col">
                      {{ x }}
                    </td>
                    <td v-for="y in axisY" :key="x + '-' + y" class="data-cell">
                      <span :class="{ 'value-zero': pivotValue(x, y) === 0 }">
                        {{ pivotValue(x, y) }}
                      </span>
                    </td>
                    <td class="data-cell row-total">
                      {{ rowTotal(x) }}
                    </td>
                  </tr>

                  <tr v-if="axisX.length > 0" class="footer-row">
                    <td class="sticky-corner footer-label">TOTAL GENERAL</td>
                    <td v-for="y in axisY" :key="'total-' + y" class="footer-cell">
                      {{ colTotal(y) }}
                    </td>
                    <td class="footer-cell grand-total">
                      {{ totalCount }}
                    </td>
                  </tr>

                  <tr v-if="axisX.length === 0">
                    <td :colspan="axisY.length + 2" class="empty-state">
                      No se encontraron coincidencias.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

// --- IMPORTS DE SERVICIOS (Ajusta la ruta si es necesario) ---
import {
  getReporteMatrizNacionalidadPorCai,
  getReporteMatrizEdadPorCai,
  getReporteMatrizInfraccionPorCai,
  getReporteMatrizMedidasPorCai,
} from "@/service/reporteria.service.js";

// --- CONFIGURACIÓN ---
const REPORTS = [
  {
    key: "medidas",
    label: "Medidas Socioeducativas",
    permission: "/reporteria/matriz/medidas",
    fetch: getReporteMatrizMedidasPorCai,
    defaultTitle: "Numérico de Adolescentes por Medidas"
  },
  {
    key: "edad",
    label: "Población por Edad",
    permission: "/reporteria/matriz/edad",
    fetch: getReporteMatrizEdadPorCai,
    defaultTitle: "Adolescentes por Edad"
  },
  {
    key: "infraccion",
    label: "Tipo de Infracción",
    permission: "/reporteria/matriz/infraccion",
    fetch: getReporteMatrizInfraccionPorCai,
    defaultTitle: "Población por Tipo de Infracción"
  },
  {
    key: "nacionalidad",
    label: "Nacionalidad",
    permission: "/reporteria/matriz/nacionalidad",
    fetch: getReporteMatrizNacionalidadPorCai,
    defaultTitle: "Población por Nacionalidad"
  },
];

// --- ESTADO ---
const isLoading = ref(false);
const errorMessage = ref("");
const search = ref("");
const reportData = ref({ titulo: "", data: [] });

// --- PERMISOS ---
const permisosStr = localStorage.getItem("snai_permisos");
const permisos = permisosStr ? JSON.parse(permisosStr) : [];
const tieneAcceso = (endpoint) => true; 
const availableReports = computed(() => REPORTS.filter((r) => tieneAcceso(r.permission)));

const selectedReportKey = ref(availableReports.value.length ? availableReports.value[0].key : "");
const currentReportConfig = computed(() => availableReports.value.find((r) => r.key === selectedReportKey.value));
const selectedReportLabel = computed(() => currentReportConfig.value?.label || "Seleccione un reporte");

// --- LÓGICA DE DATOS ---
const normalizeRow = (row) => ({
  ejeX: String(row.ejeX || "Sin Definir").trim(),
  ejeY: String(row.ejeY || "Sin Asignar").trim(),
  cantidad: Number(row.cantidad) || 0
});

const filteredRows = computed(() => {
  const rawData = Array.isArray(reportData.value.data) ? reportData.value.data : [];
  const normalized = rawData.map(normalizeRow);
  if (!search.value) return normalized;
  const term = search.value.toLowerCase();
  return normalized.filter(row => 
    row.ejeX.toLowerCase().includes(term) || row.ejeY.toLowerCase().includes(term)
  );
});

// Ordenamiento Natural (1, 2, 10...)
const naturalSort = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare;

const axisX = computed(() => {
  const uniqueX = new Set(filteredRows.value.map(r => r.ejeX));
  return Array.from(uniqueX).sort(naturalSort);
});

const axisY = computed(() => {
  const uniqueY = new Set(filteredRows.value.map(r => r.ejeY));
  return Array.from(uniqueY).sort(naturalSort);
});

const pivotMap = computed(() => {
  const map = new Map();
  filteredRows.value.forEach(row => map.set(`${row.ejeX}|${row.ejeY}`, row.cantidad));
  return map;
});

const pivotValue = (x, y) => pivotMap.value.get(`${x}|${y}`) ?? 0;
const rowTotal = (x) => axisY.value.reduce((sum, y) => sum + pivotValue(x, y), 0);
const colTotal = (y) => axisX.value.reduce((sum, x) => sum + pivotValue(x, y), 0);
const totalCount = computed(() => filteredRows.value.reduce((sum, row) => sum + row.cantidad, 0));

// --- API ---
const reload = async () => {
  if (!currentReportConfig.value) return;
  isLoading.value = true;
  errorMessage.value = "";
  reportData.value = { titulo: "", data: [] };

  try {
    const res = await currentReportConfig.value.fetch();
    const payload = res.data?.data || res.data || {};
    
    if (Array.isArray(payload)) {
      reportData.value = { titulo: currentReportConfig.value.defaultTitle, data: payload };
    } else {
      reportData.value = {
        titulo: payload.titulo || currentReportConfig.value.defaultTitle,
        data: Array.isArray(payload.data) ? payload.data : []
      };
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = "Error al obtener los datos. Verifique su conexión.";
  } finally {
    isLoading.value = false;
  }
};

const handleReportChange = () => {
  search.value = "";
  reload();
};

onMounted(() => {
  if (availableReports.value.length > 0) reload();
});
</script>

<style scoped>
/* =========================================
   ESTILOS GENERALES
========================================= */
.salud-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #334155;
  background-color: #f1f5f9; 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 0; /* Quitamos gap para que el Hero se una al header si es necesario */
}

/* =========================================
   HERO SECTION (AZUL DEGRADADO - NUEVO DISEÑO)
========================================= */
.hero {
  /* Fondo Azul Intenso Degradado de izquierda a derecha */
  background: linear-gradient(90deg, #152b65 0%, #1e40af 50%, #3b82f6 100%); 
  color: white;
  padding: 30px 40px;
  /* Quitamos bordes redondeados y margen inferior para que parezca una barra completa */
  margin-bottom: 24px; 
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  max-width: 1400px; /* Limitar ancho para pantallas muy grandes */
  margin: 0 auto;
  width: 100%;
}

.hero-header {
  flex: 1;
  min-width: 300px;
}

.page-subtitle {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 4px 0;
  color: rgba(255, 255, 255, 0.8);
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: white;
  line-height: 1.1;
}

.page-description {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.hero-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* Tarjetas (Estilo Flat Azul) */
.stat-card {
  /* Fondo azul sólido con cierta transparencia para dejar ver el degradado */
  background: rgba(43, 85, 185, 0.4); 
  border: 1px solid rgba(255, 255, 255, 0.15); /* Borde sutil */
  border-radius: 8px;
  padding: 16px 20px;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  transition: background 0.2s;
}

.stat-card:hover {
    background: rgba(43, 85, 185, 0.6);
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

/* =========================================
   PANEL Y TOOLBAR
========================================= */
.panel {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 500px;
  margin: 0 24px 24px 24px; /* Margen para separarlo de los bordes de la página */
}

.toolbar {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background-color: #fff;
  flex-wrap: wrap;
  gap: 20px;
}

.toolbar-left {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
}

.select-wrapper select {
  padding: 8px 36px 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #1e293b;
  min-width: 250px;
  background-color: white;
  height: 38px;
}

.btn-primary {
  height: 38px;
  padding: 0 20px;
  background-color: #0f172a;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-primary:hover { background-color: #1e293b; }

.search-wrap {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
}
.search-input {
  padding: 8px 12px 8px 32px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  width: 240px;
  height: 38px;
  box-sizing: border-box;
}

/* =========================================
   TABLA (PIVOT TABLE) - ESTILO EXCEL AZUL
========================================= */
.report-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.report-header-internal {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}
.report-header-internal h4 {
  margin: 0;
  color: #334155;
  font-size: 1.1rem;
}
.badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.pivot-card {
  flex: 1;
  overflow: hidden;
  position: relative;
  border-top: 1px solid #e2e8f0;
}
.pivot-scroll-container {
  overflow: auto;
  max-height: 650px;
}

.pivot-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.85rem;
}

/* Headers Sticky */
.pivot-table th {
  padding: 10px 8px;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #94a3b8;
  border-right: 1px solid #cbd5e1;
}

/* Columna Azul */
.col-header {
  background: #4472c4; /* Azul Excel */
  color: white;
  text-align: center;
  min-width: 100px;
}
.header-total {
  background: #2f5597; /* Azul Oscuro */
  color: white;
  min-width: 80px;
}

/* Esquina Sticky */
.sticky-corner {
  position: sticky;
  left: 0;
  top: 0;
  z-index: 30;
  background: #4472c4;
  color: white;
  min-width: 180px;
  border-right: 1px solid white;
}
.corner-content {
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  opacity: 0.9;
}

/* Body */
.data-cell {
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  text-align: right;
  color: #334155;
  background: white;
}
.value-zero { color: #cbd5e1; }

.sticky-col {
  position: sticky;
  left: 0;
  z-index: 20;
  background: #f8fafc;
  border-right: 2px solid #cbd5e1;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 12px;
  font-weight: 600;
  color: #1e293b;
  text-align: left;
}

.row-total {
  background: #eef2ff;
  font-weight: 700;
  color: #1e3a8a;
  border-left: 1px solid #cbd5e1;
}

/* Footer */
.footer-row td {
  position: sticky;
  bottom: 0;
  z-index: 25;
  border-top: 2px solid #94a3b8;
  font-weight: 700;
  padding: 10px 12px;
  text-align: right;
}
.footer-label {
  z-index: 35;
  background: #2f5597;
  color: white;
  text-align: left;
}
.footer-cell {
  background: #d9e1f2; /* Azul claro Excel */
  color: #1e293b;
  border-right: 1px solid #cbd5e1;
}
.grand-total {
  background: #b4c6e7;
  color: #0f172a;
}

/* Utils */
.empty-state { text-align: center; padding: 40px; color: #64748b; font-style: italic; }
.status { padding: 60px; text-align: center; color: #64748b; }
.error { color: #dc2626; background: #fef2f2; }
.loading { color: #3b82f6; }

.spinner-lg {
  width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #3b82f6;
  border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;
}
.spinner-sm {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .hero-content { flex-direction: column; align-items: flex-start; }
  .hero-stats { overflow-x: auto; padding-bottom: 8px; width: 100%; }
  .stat-card { min-width: 160px; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .panel { margin: 0 16px 16px 16px; }
}
</style>