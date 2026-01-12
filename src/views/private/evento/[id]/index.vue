<template>
  <div class="evento-detail-page">
    <div v-if="isLoading" class="status">Cargando datos...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

    <div v-else>
      <section class="hero">
        <button class="btn-back" @click="goBack" title="Volver a visitas" aria-label="Volver">
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
          <p class="eyebrow">Detalle de Evento</p>
          <h1>{{ visitaInfo.nombre }}</h1>
          <p class="subtitle">
            ID Registro: <strong>#{{ visitaInfo.id }}</strong>
          </p>
        </div>

        <div class="hero-stats">
          <div class="stat-card">
            <span class="label">Participantes</span>
            <strong>{{ familias.length }}</strong>
            <span class="hint">Familias / interacciones</span>
          </div>

          <div class="stat-card">
            <span class="label">Estado</span>
            <strong>{{ familias.length > 0 ? "Con registros" : "Sin registros" }}</strong>
            <span class="hint">Actividad del evento</span>
          </div>

          <div class="stat-card">
            <span class="label">Página</span>
            <strong>Detalle</strong>
            <span class="hint">Vista individual</span>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="section-header">
          <h3>Historial de Interacciones</h3>
          <p>Familias y adolescentes vinculados a este evento o visita.</p>
        </div>

        <div v-if="familias.length > 0" class="items-grid">
          <div v-for="fam in familias" :key="fam.id" class="item-card">
            <div class="item-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div class="item-info">
              <span class="item-name">
                {{ fam.adolescente?.nombres || "—" }} {{ fam.adolescente?.apellidos || "" }}
              </span>
              <span class="item-meta">Detalle: {{ fam.detalle || "—" }}</span>
              <span class="item-date">{{ formatDate(fam.fecha) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="empty">
          <svg
            width="46"
            height="46"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <strong>Sin interacciones</strong>
          <span>No hay familias registradas en este evento todavía.</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getEventoById } from "@/service/evento.service.js";
import { getFamilias } from "@/service/familia.service.js";

const route = useRoute();
const router = useRouter();

const visitaId = computed(() => Number(route.params.id));
const visitaData = ref(null);
const familias = ref([]);

const isLoading = ref(false);
const errorMessage = ref("");

const visitaInfo = computed(() => ({
  id: visitaId.value,
  nombre:
    visitaData.value?.descripcion ||
    visitaData.value?.nombre ||
    `Evento #${visitaId.value}`,
}));

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.familias)) return payload.familias;
  return [];
};

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("es-EC", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const loadData = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  familias.value = [];
  visitaData.value = null;

  try {
    const resEvento = await getEventoById(visitaId.value);
    visitaData.value = resEvento?.data?.data ?? resEvento?.data ?? null;

    const resFamilias = await getFamilias({ eventoId: visitaId.value, size: 100 });
    familias.value = resolveList(resFamilias);
  } catch (err) {
    console.error(err);
    errorMessage.value = "No se pudo cargar la información del evento.";
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push("/app/visitas");
};

onMounted(loadData);
</script>

<style scoped>
.evento-detail-page {
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 14px 16px;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  opacity: 0.9;
}

.stat-card strong {
  font-size: 1.3rem;
}

.label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
}

.hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: white;
  padding: 22px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 14px;
}

.section-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.1rem;
}

.section-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.item-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  background: #ffffff;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: transform 0.08s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.item-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.08);
  border-color: #cbd5e1;
}

.item-icon {
  width: 38px;
  height: 38px;
  background: #f8fafc;
  color: #334155;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: #0f172a;
}

.item-meta {
  font-size: 0.86rem;
  color: #64748b;
}

.item-date {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 2px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  gap: 10px;
  color: #64748b;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
}

.empty strong {
  color: #0f172a;
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
  .hero {
    padding: 22px;
  }

  .hero-main h1 {
    font-size: 1.55rem;
  }
}
</style>
