<template>
  <div class="page-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando expediente jurídico...</p>
    </div>

    <div v-else-if="!data" class="error-state">
      <p>No se pudo cargar la información del registro #{{ $route.params.id }}</p>
      <button @click="goBack" class="btn-back">Volver al listado</button>
    </div>

    <div v-else class="detail-content">
      <header class="detail-header">
        <button @click="goBack" class="btn-back">← Volver</button>
        <div class="title-group">
          <h1>Causa: {{ data.numeroCausa }}</h1>
          <span class="badge">ID: #{{ data.id }}</span>
        </div>
      </header>

      <div class="info-grid">
        <section class="info-card">
          <h3>Datos del Adolescente</h3>
          <div class="row">
            <span class="label">Nombres:</span>
            <span class="value">{{ data.adolescente?.nombre }} {{ data.adolescente?.apellido }}</span>
          </div>
          <div class="row">
            <span class="label">Cédula:</span>
            <span class="value">{{ data.adolescente?.cedula }}</span>
          </div>
        </section>

        <section class="info-card">
          <h3>Detalle del Proceso</h3>
          <div class="row">
            <span class="label">Delito:</span>
            <span class="value">{{ data.delito?.nombre }}</span>
          </div>
          <div class="row">
            <span class="label">Juez:</span>
            <span class="value">{{ data.juez || '—' }}</span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getJuridico } from '@/service/juridico.service';

const route = useRoute();
const router = useRouter();
const data = ref(null);
const loading = ref(true);

onMounted(async () => {
  const idFromUrl = route.params.id;
  console.log("Comprobación rápida - ID en URL:", idFromUrl);
  if (!idFromUrl) {
    console.warn("No hay ID en la URL");
    return;
  }
  await loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const res = await getJuridico(id);
    // IMPORTANTE: res.data.data según tu Swagger
    if (res.data && res.data.success) {
      data.value = res.data.data;
    }
  } catch (e) {
    console.error("Error cargando detalle:", e);
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.push('/app/juridico');

onMounted(loadData);
</script>

<style scoped>
.page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
.loading-state, .error-state { text-align: center; padding: 100px; color: #64748b; }
.spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

.detail-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
.btn-back { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.title-group h1 { margin: 0; font-size: 1.8rem; color: #0f172a; }
.badge { background: #eff6ff; color: #2563eb; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 700; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.info-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.info-card h3 { margin-top: 0; font-size: 1rem; color: #3b82f6; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
.row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.95rem; }
.label { color: #64748b; }
.value { font-weight: 600; color: #1e293b; }
</style>