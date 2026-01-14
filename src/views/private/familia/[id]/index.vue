<template>
  <div v-if="loading" class="status">
    <div class="spinner"></div>
    <span>Cargando información...</span>
  </div>

  <div v-else-if="item" class="detail">
    <div class="header">
      <p class="eyebrow">Detalle de Registro Familiar #{{ item.id }}</p>
      <h2 class="title">Evento ID: {{ item.eventoId }}</h2>
      <p class="subtitle">
        Fecha de registro: {{ formatDate(item.fecha) }}
      </p>
    </div>

    <div class="card">
      
      <div v-if="item.adolescente" class="row">
        <span class="label">Adolescente</span>
        <span class="value">{{ item.adolescente.nombre }} {{ item.adolescente.apellido }}</span>
      </div>

      <div class="row">
        <span class="label">ID de Evento Asociado</span>
        <span class="value">#{{ item.eventoId }}</span>
      </div>

      <div class="row column">
        <span class="label">Detalle de la Interacción</span>
        <p class="value description">
          {{ item.detalle || 'Sin detalles registrados.' }}
        </p>
      </div>

      <div class="actions">
        <button class="btn-back" @click="$router.back()">Volver al listado</button>
      </div>
    </div>
  </div>

  <div v-else class="status error">
    No se encontró la información solicitada.
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
// Ajusta la ruta relativa según donde esté este archivo
import { getFamiliaById } from "../../../../service/familia.service"; 

const route = useRoute();
const router = useRouter();
const item = ref(null);
const loading = ref(true);

const formatDate = (dateStr) => {
  if (!dateStr) return "Fecha no registrada";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

onMounted(async () => {
  try {
    const id = route.params.id;
    if (!id) return;

    const res = await getFamiliaById(id);
    const payload = res.data || res;
    item.value = payload.data || payload; 
    
  } catch (e) {
    console.error("Error cargando detalle:", e);
    item.value = null;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.detail {
  display: flex; flex-direction: column; gap: 24px; max-width: 800px; margin: 0 auto; width: 100%;
}

.header {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white; padding: 32px; border-radius: 24px; position: relative; overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}
.header::before, .header::after {
  content: ""; position: absolute; border-radius: 999px; background: rgba(255, 255, 255, 0.08);
}
.header::before { width: 220px; height: 220px; top: -60px; right: -40px; }
.header::after { width: 140px; height: 140px; bottom: -50px; left: 40px; }

.eyebrow {
  text-transform: uppercase; letter-spacing: 2px; font-size: 0.75rem; margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.7); position: relative; z-index: 1; font-weight: 600;
}
.title { margin: 0 0 8px; font-size: 2rem; position: relative; z-index: 1; font-weight: 800; }
.subtitle { margin: 0; font-size: 1rem; color: rgba(255, 255, 255, 0.85); position: relative; z-index: 1; }

.card {
  background: white; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05); display: flex; flex-direction: column; gap: 16px;
}

.row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 16px 20px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0;
}
.row.column { flex-direction: column; align-items: flex-start; gap: 8px; }

.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; min-width: 120px; }
.value { font-size: 1rem; color: #0f172a; font-weight: 600; text-align: right; }
.value.description { text-align: left; line-height: 1.6; color: #334155; font-weight: 400; width: 100%; }

.actions { margin-top: 8px; display: flex; justify-content: flex-end; }
.btn-back {
  background: white; border: 1px solid #e2e8f0; padding: 10px 24px; border-radius: 12px;
  color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }

.status {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px; background: #f8fafc; border-radius: 20px; color: #64748b; gap: 12px; border: 1px dashed #cbd5e1;
}
.status.error { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.spinner {
  width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>