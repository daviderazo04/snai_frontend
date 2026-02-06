<!-- src/views/reporteria/Index.vue -->
<template>
  <div class="salud-page">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Reportería</p>
        <h1>Reportes</h1>
        <p class="subtitle">Consulta reportes demográficos y matrices por CAI.</p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Reporte</span>
          <strong>{{ selectedReportLabel }}</strong>
          <span class="hint">Selección actual</span>
        </div>

        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalCount }}</strong>
          <span class="hint">Suma de resultados</span>
        </div>

        <div class="stat-card">
          <span class="label">Página</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
          <span class="hint">Paginación activa</span>
        </div>
      </div>
    </section>

    <!-- PANEL -->
    <section class="panel">
      <!-- Si NO hay permisos de reportería -->
      <div v-if="availableReports.length === 0" class="status error">
        No tienes permisos para acceder a la reportería.
      </div>

      <template v-else>
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="toolbar-title">
              <h3>Panel de reportes</h3>
              <p>Elige un reporte y filtra resultados.</p>
            </div>

            <div class="controls">
              <label class="control">
                <span class="control-label">Reporte</span>
                <select v-model="selectedReportKey" class="control-input" @change="reload">
                  <option v-for="r in availableReports" :key="r.key" :value="r.key">
                    {{ r.label }}
                  </option>
                </select>
              </label>

              <button class="btn" @click="reload" :disabled="isLoading">
                {{ isLoading ? "Actualizando..." : "Actualizar" }}
              </button>
            </div>
          </div>

          <div class="toolbar-right">
            <div class="search-wrap">
              <span class="search-icon">🔎</span>
              <input
                v-model="search"
                class="search-input"
                type="text"
                placeholder="Filtrar por etiqueta / ejeX / ejeY..."
              />
            </div>
          </div>
        </div>

        <!-- Estado -->
        <div v-if="isLoading" class="status">
          <div class="spinner"></div>
          <span>Cargando reporte...</span>
        </div>
        <div v-else-if="errorMessage" class="status error">
          {{ errorMessage }}
        </div>

        <!-- Vista Reporte: DEMOGRÁFICO -->
        <div v-else-if="viewMode === 'simple'" class="report-block">
          <div class="block-header">
            <h4>{{ reportSimple.titulo || "Reporte" }}</h4>
            <span class="chip">{{ simpleRows.length }} filas</span>
          </div>

          <div class="table-card">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Etiqueta</th>
                  <th class="text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in pagedSimpleRows" :key="r.etiqueta">
                  <td>{{ r.etiqueta }}</td>
                  <td class="text-right">{{ r.cantidad }}</td>
                </tr>
                <tr v-if="pagedSimpleRows.length === 0">
                  <td colspan="2" class="empty">No hay datos para mostrar.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Vista Reporte: MATRIZ -->
        <div v-else class="report-block">
          <div class="block-header">
            <h4>{{ reportMatrix.titulo || "Reporte Matriz" }}</h4>
            <span class="chip">{{ filteredMatrixRows.length }} registros</span>
          </div>

          <!-- Pivot -->
          <div class="pivot-card">
            <div class="pivot-head">
              <div class="pivot-title">Tabla resumen</div>
              <div class="pivot-meta">
                <span>{{ axisX.length }} ejeX</span>
                <span class="dot">•</span>
                <span>{{ axisY.length }} ejeY</span>
              </div>
            </div>

            <div class="pivot-wrap">
              <table class="pivot-table">
                <thead>
                  <tr>
                    <th class="sticky-left">Eje X</th>
                    <th v-for="y in axisY" :key="y" class="col-y">{{ y }}</th>
                    <th class="col-total text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="x in axisX" :key="x">
                    <td class="sticky-left">
                      <strong>{{ x }}</strong>
                    </td>
                    <td v-for="y in axisY" :key="x + '|' + y" class="text-right">
                      {{ pivotValue(x, y) }}
                    </td>
                    <td class="text-right col-total">
                      <strong>{{ rowTotal(x) }}</strong>
                    </td>
                  </tr>

                  <tr v-if="axisX.length">
                    <td class="sticky-left col-total"><strong>Total</strong></td>
                    <td v-for="y in axisY" :key="'total|' + y" class="text-right col-total">
                      <strong>{{ colTotal(y) }}</strong>
                    </td>
                    <td class="text-right col-total">
                      <strong>{{ totalCount }}</strong>
                    </td>
                  </tr>

                  <tr v-if="axisX.length === 0">
                    <td :colspan="axisY.length + 2" class="empty">No hay datos para mostrar.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Raw table -->
          <div class="table-card">
            <div class="raw-head">
              <div class="raw-title">Detalle</div>
              <div class="raw-hint">Útil para exportar o auditar resultados</div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th>Eje X</th>
                  <th>Eje Y</th>
                  <th class="text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in pagedMatrixRows" :key="r.ejeX + '|' + r.ejeY">
                  <td>{{ r.ejeX }}</td>
                  <td>{{ r.ejeY }}</td>
                  <td class="text-right">{{ r.cantidad }}</td>
                </tr>
                <tr v-if="pagedMatrixRows.length === 0">
                  <td colspan="3" class="empty">No hay datos para mostrar.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Paginación -->
        <div class="pagination">
          <button class="pbtn" :disabled="currentPage === 1" @click="currentPage--">Anterior</button>
          <div class="pinfo">Página <strong>{{ currentPage }}</strong> de <strong>{{ totalPages }}</strong></div>
          <button class="pbtn" :disabled="currentPage >= totalPages" @click="currentPage++">Siguiente</button>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  getReporteDemograficoEtnia,
  getReporteMatrizNacionalidadPorCai,
  getReporteMatrizEdadPorCai,
  getReporteMatrizInfraccionPorCai,
  getReporteMatrizMedidasPorCai,
} from "@/service/reporteria.service.js";

/* ======================
   PERMISOS (VIEW)
====================== */
const permisosStr = localStorage.getItem("snai_permisos");
const permisos = permisosStr ? JSON.parse(permisosStr) : [];

const normalizar = (endpoint) => {
  if (!endpoint) return endpoint;
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
};

const tieneAcceso = (endpoint) => {
  if (!endpoint) return true;
  const ep = normalizar(endpoint);

  const exact = permisos.find((p) => normalizar(p.endpoint) === ep);
  if (exact && exact.VIEW === true) return true;

  return permisos.some((p) => {
    const pe = normalizar(p.endpoint);
    return p.VIEW === true && pe.startsWith(ep + "/");
  });
};

/* ======================
   DEFINICIÓN DE REPORTES
====================== */
const REPORTS = [
  { key: "etnia", label: "Etnia", permission: "/reporteria/demografico/etnia", mode: "simple", fetch: getReporteDemograficoEtnia, defaultTitle: "Etnia" },
  { key: "nacionalidad", label: "Nacionalidad x CAI", permission: "/reporteria/matriz/nacionalidad", mode: "matrix", fetch: getReporteMatrizNacionalidadPorCai, defaultTitle: "Nacionalidad x CAI" },
  { key: "edad", label: "Edad x CAI", permission: "/reporteria/matriz/edad", mode: "matrix", fetch: getReporteMatrizEdadPorCai, defaultTitle: "Edad x CAI" },
  { key: "infraccion", label: "Infracción x CAI", permission: "/reporteria/matriz/infraccion", mode: "matrix", fetch: getReporteMatrizInfraccionPorCai, defaultTitle: "Infracción x CAI" },
  { key: "medidas", label: "Medidas x CAI", permission: "/reporteria/matriz/medidas", mode: "matrix", fetch: getReporteMatrizMedidasPorCai, defaultTitle: "Medidas x CAI" },
];

const availableReports = computed(() => REPORTS.filter((r) => tieneAcceso(r.permission)));

const selectedReportKey = ref("etnia");
const reportConfig = computed(() => availableReports.value.find((r) => r.key === selectedReportKey.value) || null);

/* ======================
   STATE
====================== */
const isLoading = ref(false);
const errorMessage = ref("");
const search = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const reportSimple = ref({ titulo: "", etiquetas: [], data: [] });
const reportMatrix = ref({ titulo: "", data: [] });

/* ======================
   HELPERS
====================== */
const safeString = (v, fallback = "Sin definir") => {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ✅ FIX REAL: tu backend a veces retorna {titulo, data:[...]} (res.data.data es ARRAY)
// entonces NO debemos retornar res.data.data primero
const resolvePayload = (res) => {
  const d = res?.data;

  // Caso A: res.data ya es el payload correcto
  if (d && typeof d === "object" && (Object.prototype.hasOwnProperty.call(d, "titulo") || Object.prototype.hasOwnProperty.call(d, "etiquetas") || Array.isArray(d.data))) {
    return d;
  }

  // Caso B: res.data.data es el payload correcto (objeto con titulo/data/etiquetas)
  const dd = d?.data;
  if (dd && typeof dd === "object" && (Object.prototype.hasOwnProperty.call(dd, "titulo") || Object.prototype.hasOwnProperty.call(dd, "etiquetas") || Array.isArray(dd.data))) {
    return dd;
  }

  return d ?? null;
};

/* ======================
   LABELS / MODE
====================== */
const selectedReportLabel = computed(() => {
  if (!reportConfig.value) return "Sin acceso";
  return reportConfig.value.label || "Reporte";
});

const viewMode = computed(() => reportConfig.value?.mode ?? "simple");

/* ======================
   SIMPLE REPORT
====================== */
const simpleRows = computed(() => {
  const etiquetas = Array.isArray(reportSimple.value?.etiquetas) ? reportSimple.value.etiquetas : [];
  const data = Array.isArray(reportSimple.value?.data) ? reportSimple.value.data : [];

  const rows = etiquetas.map((e, idx) => ({ etiqueta: safeString(e), cantidad: toNumber(data[idx]) }));

  const term = search.value.trim().toLowerCase();
  if (!term) return rows;

  return rows.filter((r) => `${r.etiqueta} ${r.cantidad}`.toLowerCase().includes(term));
});

const pagedSimpleRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return simpleRows.value.slice(start, start + pageSize.value);
});

/* ======================
   MATRIX REPORT
====================== */
const normalizedMatrixRows = computed(() => {
  const rows = Array.isArray(reportMatrix.value?.data) ? reportMatrix.value.data : [];
  return rows.map((r) => ({
    ejeX: safeString(r.ejeX),
    ejeY: safeString(r.ejeY),
    cantidad: toNumber(r.cantidad),
  }));
});

const filteredMatrixRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return normalizedMatrixRows.value;

  return normalizedMatrixRows.value.filter((r) => {
    const hay = `${r.ejeX} ${r.ejeY} ${r.cantidad}`.toLowerCase();
    return hay.includes(term);
  });
});

const pagedMatrixRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredMatrixRows.value.slice(start, start + pageSize.value);
});

const axisX = computed(() => Array.from(new Set(filteredMatrixRows.value.map((r) => r.ejeX))));
const axisY = computed(() => Array.from(new Set(filteredMatrixRows.value.map((r) => r.ejeY))));

const pivotMap = computed(() => {
  const map = new Map();
  filteredMatrixRows.value.forEach((r) => map.set(`${r.ejeX}||${r.ejeY}`, r.cantidad));
  return map;
});

const pivotValue = (x, y) => pivotMap.value.get(`${x}||${y}`) ?? 0;
const rowTotal = (x) => axisY.value.reduce((acc, y) => acc + pivotValue(x, y), 0);
const colTotal = (y) => axisX.value.reduce((acc, x) => acc + pivotValue(x, y), 0);

/* ======================
   TOTALS / PAGES
====================== */
const totalCount = computed(() => {
  if (viewMode.value === "simple") return simpleRows.value.reduce((acc, r) => acc + r.cantidad, 0);
  return filteredMatrixRows.value.reduce((acc, r) => acc + r.cantidad, 0);
});

const totalPages = computed(() => {
  const count = viewMode.value === "simple" ? simpleRows.value.length : filteredMatrixRows.value.length;
  return Math.max(1, Math.ceil(count / pageSize.value));
});

/* ======================
   LOAD
====================== */
const loadReport = async () => {
  if (availableReports.value.length === 0) {
    errorMessage.value = "";
    reportSimple.value = { titulo: "", etiquetas: [], data: [] };
    reportMatrix.value = { titulo: "", data: [] };
    return;
  }

  if (!reportConfig.value) {
    selectedReportKey.value = availableReports.value[0].key;
  }

  if (!reportConfig.value) {
    errorMessage.value = "No tienes permisos para este reporte.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res = await reportConfig.value.fetch();
    const payload = resolvePayload(res);

    if (reportConfig.value.mode === "simple") {
      reportSimple.value = {
        titulo: payload?.titulo ?? reportConfig.value.defaultTitle,
        etiquetas: payload?.etiquetas ?? [],
        data: payload?.data ?? [],
      };
      reportMatrix.value = { titulo: "", data: [] };
    } else {
      reportMatrix.value = {
        titulo: payload?.titulo ?? reportConfig.value.defaultTitle,
        data: payload?.data ?? [],
      };
      reportSimple.value = { titulo: "", etiquetas: [], data: [] };
    }
  } catch (e) {
    console.error("Error cargando reportería:", e);
    errorMessage.value = e?.response?.data?.message || "No se pudo cargar el reporte.";
    reportSimple.value = { titulo: "", etiquetas: [], data: [] };
    reportMatrix.value = { titulo: "", data: [] };
  } finally {
    isLoading.value = false;
  }
};

const reload = async () => {
  currentPage.value = 1;
  await loadReport();
};

/* ======================
   WATCHERS / INIT
====================== */
watch(search, () => (currentPage.value = 1));
watch(totalPages, (val) => { if (currentPage.value > val) currentPage.value = val; });

watch(selectedReportKey, () => {
  search.value = "";
  currentPage.value = 1;
  if (availableReports.value.length) loadReport();
});

onMounted(() => {
  if (availableReports.value.length) {
    if (!availableReports.value.some((r) => r.key === selectedReportKey.value)) {
      selectedReportKey.value = availableReports.value[0].key;
    }
  }
  loadReport();
});
</script>

<style scoped>
/* (Tu mismo CSS — lo dejo igual) */
.salud-page { display: flex; flex-direction: column; gap: 24px; }

.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white; padding: 28px; border-radius: 20px; position: relative; overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}
.hero::before, .hero::after {
  content: ""; position: absolute; border-radius: 999px; background: rgba(255, 255, 255, 0.08);
}
.hero::before { width: 220px; height: 220px; top: -60px; right: -40px; }
.hero::after { width: 140px; height: 140px; bottom: -50px; left: 40px; }

.hero-main { position: relative; z-index: 1; max-width: 640px; }
.eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; margin-bottom: 8px; opacity: 0.7; }
.hero-main h1 { margin: 0 0 8px; font-size: 2rem; }
.subtitle { margin: 0; font-size: 0.98rem; opacity: 0.85; }

.hero-stats { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 20px; }
.stat-card {
  background: rgba(255, 255, 255, 0.12); border-radius: 16px; padding: 14px 16px;
  backdrop-filter: blur(6px); display: flex; flex-direction: column; gap: 6px;
}
.stat-card strong { font-size: 1.2rem; }
.label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
.hint { font-size: 0.78rem; opacity: 0.7; }

.panel {
  display: flex; flex-direction: column; gap: 18px; background: white; padding: 22px;
  border-radius: 18px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.toolbar {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 18px;
  padding: 10px 6px;
}
.toolbar-title h3 { margin: 0; font-size: 1.2rem; color: #0f172a; }
.toolbar-title p { margin: 6px 0 0; color: #64748b; font-size: 0.92rem; }

.controls { display: flex; align-items: flex-end; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
.control { display: flex; flex-direction: column; gap: 6px; }
.control-label { font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #64748b; }
.control-input {
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; background: #f8fafc;
  min-width: 260px; font-weight: 700; color: #0f172a;
}

.btn {
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; background: #0f172a;
  color: white; font-weight: 800; cursor: pointer;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.search-wrap { position: relative; min-width: 320px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.6; }
.search-input {
  width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px 10px 36px;
  background: #f8fafc;
}

.status {
  padding: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;
}
.status.error { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
.spinner {
  width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.report-block { display: flex; flex-direction: column; gap: 14px; }

.block-header {
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
}
.block-header h4 { margin: 0; color: #0f172a; font-size: 1.05rem; }
.chip {
  border: 1px solid #e2e8f0; background: #f8fafc; color: #0f172a;
  border-radius: 999px; padding: 6px 10px; font-size: 0.85rem; font-weight: 800;
}

.table-card {
  border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background: white;
}
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;
  color: #64748b; background: #f8fafc; padding: 14px 16px; border-bottom: 1px solid #e2e8f0;
}
.data-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
.text-right { text-align: right; }
.empty { text-align: center; padding: 28px; color: #94a3b8; }

.pivot-card {
  border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background: white;
}
.pivot-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;
}
.pivot-title { font-weight: 900; color: #0f172a; }
.pivot-meta { color: #64748b; font-weight: 700; font-size: 0.9rem; display: inline-flex; gap: 10px; align-items: center; }
.dot { opacity: 0.6; }

.pivot-wrap { overflow: auto; max-height: 420px; }
.pivot-table { width: 100%; border-collapse: collapse; min-width: 840px; }
.pivot-table th, .pivot-table td { border-bottom: 1px solid #f1f5f9; padding: 10px 12px; }
.pivot-table th { background: #ffffff; position: sticky; top: 0; z-index: 2; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
.sticky-left { position: sticky; left: 0; background: white; z-index: 3; border-right: 1px solid #f1f5f9; }
.col-total { background: #f8fafc; border-left: 1px solid #f1f5f9; }

.raw-head { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.raw-title { font-weight: 900; color: #0f172a; }
.raw-hint { color: #64748b; font-size: 0.9rem; margin-top: 4px; }

.pagination {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 10px 2px;
}
.pbtn {
  padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: white; font-weight: 800; color: #0f172a; cursor: pointer;
}
.pbtn:disabled { opacity: 0.55; cursor: not-allowed; }
.pinfo { color: #475569; font-weight: 700; }

@media (max-width: 720px) {
  .hero { padding: 22px; }
  .hero-main h1 { font-size: 1.6rem; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-wrap { min-width: 100%; }
  .control-input { min-width: 100%; }
}
</style>
