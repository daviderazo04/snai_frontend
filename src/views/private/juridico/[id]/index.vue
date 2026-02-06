<template>
  <!-- Loading -->
  <div v-if="loading" class="status">
    <div class="spinner"></div>
    <span>Cargando información jurídica...</span>
  </div>

  <!-- Detail -->
  <div v-else-if="data" class="detail">
    <div class="header">
      <p class="eyebrow">Detalle de Registro Jurídico #{{ data.id }}</p>
      <h2 class="title">Causa N° {{ data.numeroCausa }}</h2>
      <p class="subtitle">
        Fecha de inicio: {{ formatDate(data.fechaInicio) }}
      </p>
    </div>

    <div class="card">
      <!-- Adolescente -->
      <div v-if="data.adolescente" class="row">
        <span class="label">Adolescente</span>
        <span class="value">
          {{ data.adolescente.nombre }} {{ data.adolescente.apellido }}
        </span>
      </div>

      <!-- Delito -->
      <div class="row">
        <span class="label">Delito</span>
        <span class="value">{{ data.delito?.nombre || '—' }}</span>
      </div>

      <!-- Autoridades -->
      <div class="row">
        <span class="label">Juez</span>
        <span class="value">{{ data.juez || '—' }}</span>
      </div>

      <div class="row">
        <span class="label">Fiscal</span>
        <span class="value">{{ data.fiscal || '—' }}</span>
      </div>

      <div class="row">
        <span class="label">Defensor</span>
        <span class="value">{{ data.defensor || '—' }}</span>
      </div>

      <!-- Medidas -->
      <div class="row column">
        <span class="label">Medidas</span>
        <p class="value description">
          {{ data.medidas || 'Sin medidas registradas.' }}
        </p>
      </div>

      <div class="row">
        <span class="label">Boleta Preventivo</span>
        <span class="value">{{ data.boletaPreventivo || '—' }}</span>
      </div>

      <div class="row">
        <span class="label">Boleta Cárcel</span>
        <span class="value">{{ data.boletaCarcel || '—' }}</span>
      </div>

      <!-- Fechas del proceso -->
      <div class="row">
        <span class="label">Audiencia</span>
        <span class="value">{{ formatDate(data.fechaAudiencia) }}</span>
      </div>

      <div class="row">
        <span class="label">Sentencia</span>
        <span class="value">{{ formatDate(data.fechaSentencia) }}</span>
      </div>

      <div class="row">
        <span class="label">Fin del Proceso</span>
        <span class="value">{{ formatDate(data.fechaFin) }}</span>
      </div>

      <div class="row">
        <span class="label">Cumplimiento 60%</span>
        <span class="value">{{ formatDate(data.fecha60) }}</span>
      </div>

      <div class="row">
        <span class="label">Cumplimiento 80%</span>
        <span class="value">{{ formatDate(data.fecha80) }}</span>
      </div>

      <!-- Sentencia -->
      <div class="row">
        <span class="label">Sentencia</span>
        <span class="value">
          {{ data.tiempoAnio }}a {{ data.tiempoMes }}m {{ data.sentenciaDia }}d
        </span>
      </div>

      <!-- Recursos -->
      <div class="row">
        <span class="label">Recurso Apelación</span>
        <span class="value">{{ data.recApelMod || '—' }}</span>
      </div>

      <div class="row">
        <span class="label">Fecha Apelación</span>
        <span class="value">{{ formatDate(data.RecApelFecha) }}</span>
      </div>

      <div class="row">
        <span class="label">Casación</span>
        <span class="value">{{ data.casacionRecurso || '—' }}</span>
      </div>

      <div class="row">
        <span class="label">Fecha Casación</span>
        <span class="value">{{ formatDate(data.casacionFecha) }}</span>
      </div>

      <!-- Egreso -->
      <div class="row">
        <span class="label">Fecha de Egreso</span>
        <span class="value">{{ formatDate(data.egresoFecha) }}</span>
      </div>

      <div class="row">
        <span class="label">Motivo de Egreso</span>
        <span class="value">{{ data.egresoMotivo || '—' }}</span>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="btn-back" @click="$router.back()">
          Volver al listado
        </button>
      </div>
    </div>
  </div>

  <!-- Error -->
  <div v-else class="status error">
    No se encontró la información solicitada.
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getJuridico } from "@/service/juridico.service";

const route = useRoute();

const loading = ref(true);
const data = ref(null);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(async () => {
  try {
    const id = route.params.id;
    const res = await getJuridico(id);
    const payload = res.data || res;
    data.value = payload.data || payload;
  } catch (e) {
    console.error(e);
    data.value = null;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.header {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white;
  padding: 32px;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}

.header::before,
.header::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.header::before {
  width: 220px;
  height: 220px;
  top: -60px;
  right: -40px;
}

.header::after {
  width: 140px;
  height: 140px;
  bottom: -50px;
  left: 40px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75rem;
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.title {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 800;
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
}

.card {
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.row.column {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  font-weight: 700;
  min-width: 160px;
}

.value {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
  text-align: right;
}

.value.description {
  text-align: left;
  line-height: 1.6;
  color: #334155;
  font-weight: 400;
  width: 100%;
}

.actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.btn-back {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 10px 24px;
  border-radius: 12px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #f8fafc;
  border-radius: 20px;
  color: #64748b;
  gap: 12px;
  border: 1px dashed #cbd5e1;
}

.status.error {
  color: #ef4444;
  background: #fef2f2;
  border-color: #fecaca;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
