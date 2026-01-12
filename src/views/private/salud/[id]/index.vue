<template>
  <div class="salud-detail-page">
    <div v-if="loading" class="status">Cargando...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div v-else-if="!item" class="status error">No se encontró el registro.</div>

    <div v-else>
      <section class="hero">
        <button class="btn-back" @click="router.back()" aria-label="Volver">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div class="hero-main">
          <p class="eyebrow">Detalle de Ficha Médica</p>
          <h1>{{ item.adolescenteNombre }}</h1>
          <p class="subtitle">
            Fecha de atención: <strong>{{ formatDate(item.fecha) }}</strong>
          </p>
        </div>

        <div class="hero-stats">
          <div class="stat-card" :class="{ active: hasDiscapacidad }">
            <span class="icon">♿</span>
            <div class="stat-body">
              <span class="label">Discapacidad</span>
              <strong>{{ hasDiscapacidad ? "Registrada" : "No presenta" }}</strong>
              <span class="hint">Estado actual</span>
            </div>
          </div>

          <div class="stat-card" :class="{ active: hasMedicacion }">
            <span class="icon">💊</span>
            <div class="stat-body">
              <span class="label">Medicación</span>
              <strong>{{ hasMedicacion ? "En tratamiento" : "No requiere" }}</strong>
              <span class="hint">Seguimiento</span>
            </div>
          </div>

          <div class="stat-card" :class="{ active: hasSustancias }">
            <span class="icon">⚠️</span>
            <div class="stat-body">
              <span class="label">Sustancias</span>
              <strong>{{ hasSustancias ? "Con registro" : "Sin registro" }}</strong>
              <span class="hint">Consumo</span>
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="grid">
          <div class="field">
            <span class="field-label">ID Registro</span>
            <span class="field-value">#{{ item.id }}</span>
          </div>

          <div class="field">
            <span class="field-label">Adolescente ID</span>
            <span class="field-value">#{{ item.adolescenteId }}</span>
          </div>

          <div class="field">
            <span class="field-label">N° Atención Médica</span>
            <span class="field-value">{{ item.numAtenMedica ?? 0 }}</span>
          </div>

          <div class="field full">
            <span class="field-label">Diagnóstico</span>
            <span class="field-value highlight">
              {{ item.diagnostico || "—" }}
            </span>
          </div>

          <div v-if="hasSustancias" class="field full">
            <span class="field-label">Tipo de Sustancia</span>
            <span class="field-value danger">
              {{ item.tipoSustancia || "—" }}
            </span>
          </div>

          <div class="field full">
            <span class="field-label">Observaciones</span>
            <span class="field-value long">
              {{ item.observacion || "Sin observaciones registradas." }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSalud } from "@/service/salud.service.js";

const route = useRoute();
const router = useRouter();

const item = ref(null);
const loading = ref(true);
const errorMessage = ref("");

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.salud)) return payload.salud;
  return [];
};

const normalize01 = (v, fallback = "0") => {
  const s =
    v === 1 || v === true
      ? "1"
      : v === 0 || v === false
      ? "0"
      : String(v ?? "");
  return s === "1" || s === "0" ? s : fallback;
};

const mapItem = (row) => {
  const rawId = row?.id ?? row?.saludId ?? row?.idSalud;
  const idNum = Number(rawId);

  const adolescenteRaw = row?.adolescenteId ?? row?.adolescente_id ?? row?.idAdolescente;
  const adolescenteIdNum = Number(adolescenteRaw);

  const numAtenRaw = row?.numAtenMedica ?? row?.num_aten_medica ?? row?.numAtenciones;
  const numAtenNum = Number(numAtenRaw);

  const nombres = row?.adolescente?.nombres ?? row?.adolescente?.nombre ?? "";
  const apellidos = row?.adolescente?.apellidos ?? "";
  const fullName = `${nombres} ${apellidos}`.trim();

  return {
    id: Number.isNaN(idNum) ? rawId : idNum,
    adolescenteId: Number.isNaN(adolescenteIdNum) ? adolescenteRaw : adolescenteIdNum,
    adolescenteNombre: fullName || (adolescenteRaw ? `Adolescente #${adolescenteRaw}` : "Adolescente"),
    fecha: row?.fecha ?? row?.date ?? "",
    diagnostico: row?.diagnostico ?? "",
    tomaMedicacion: normalize01(row?.tomaMedicacion, "0"),
    consumeSustancia: normalize01(row?.consumeSustancia, "0"),
    tipoSustancia: row?.tipoSustancia ?? "",
    numAtenMedica: Number.isNaN(numAtenNum) ? 0 : numAtenNum,
    discapacidad: normalize01(row?.discapacidad, "0"),
    observacion: row?.observacion ?? "",
  };
};

const hasDiscapacidad = computed(() => item.value?.discapacidad === "1");
const hasMedicacion = computed(() => item.value?.tomaMedicacion === "1");
const hasSustancias = computed(() => item.value?.consumeSustancia === "1");

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(async () => {
  loading.value = true;
  errorMessage.value = "";
  item.value = null;

  try {
    let res;

    // por si tu servicio acepta params { page, size }
    try {
      res = await getSalud({ page: 1, size: 500 });
    } catch {
      // o si tu servicio es simple: getSalud()
      res = await getSalud();
    }

    const list = resolveList(res).map(mapItem);
    const idParam = String(route.params.id);

    item.value = list.find((x) => String(x.id) === idParam) || null;
  } catch (e) {
    console.error("Error cargando ficha médica:", e);
    errorMessage.value = "No se pudo cargar el detalle del registro.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.salud-detail-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white;
  padding: 26px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.hero::before {
  width: 220px;
  height: 220px;
  top: -60px;
  right: -40px;
}

.hero::after {
  width: 140px;
  height: 140px;
  bottom: -50px;
  left: 40px;
}

.btn-back {
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: grid;
  place-items: center;
  backdrop-filter: blur(6px);
  margin-bottom: 12px;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.16);
}

.hero-main {
  position: relative;
  z-index: 1;
  max-width: 720px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.7rem;
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.7);
}

.hero-main h1 {
  margin: 0 0 8px;
  font-size: 1.8rem;
}

.subtitle {
  margin: 0;
  font-size: 0.98rem;
  color: rgba(255, 255, 255, 0.85);
}

.hero-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 14px 16px;
  backdrop-filter: blur(6px);
  display: flex;
  gap: 12px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  opacity: 0.78;
}

.stat-card.active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.22);
}

.icon {
  font-size: 1.35rem;
  line-height: 1;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
}

.stat-body strong {
  font-size: 1.05rem;
}

.hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: white;
  padding: 22px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  font-weight: 800;
}

.field-value {
  color: #0f172a;
  font-weight: 700;
  font-size: 0.98rem;
}

.field-value.highlight {
  font-size: 1.05rem;
}

.field-value.danger {
  color: #b91c1c;
}

.field-value.long {
  line-height: 1.6;
  color: #334155;
  font-weight: 600;
}

.status {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.92rem;
}

.status.error {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .hero-main h1 {
    font-size: 1.55rem;
  }
}
</style>
