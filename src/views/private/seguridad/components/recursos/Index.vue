<template>
  <div class="module-wrap">
    <header class="module-header">
      <div class="title-block">
        <h2>Catálogo de Endpoints</h2>
        <p class="subtitle">Recursos protegidos detectados automáticamente en la API</p>
      </div>
      <div class="info-badge">
        <span class="icon">ℹ️</span>
        <p>Estos recursos se sincronizan al iniciar el servidor y se utilizan para la matriz de permisos.</p>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Sincronizando recursos...</span>
    </div>

    <RecursoTable v-else :items="items" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSystemEndpoints } from '@/service/users-roles.service.js';
import RecursoTable from './RecursoTable.vue';

const items = ref([]);
const loading = ref(false);

/**
 * Carga los endpoints desde RolesService.getFlatEndpoints
 */
onMounted(async () => {
  loading.value = true;
  try { 
    const res = await getSystemEndpoints(); 
    // res.data contiene el arreglo de EndpointFlatResponseDto
    items.value = res.data || []; 
  } catch (error) {
    console.error("Error al cargar recursos del sistema:", error);
  } finally { 
    loading.value = false; 
  }
});
</script>

<style scoped>
.module-wrap { display: flex; flex-direction: column; gap: 24px; }

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.title-block h2 { margin: 0; font-size: 1.4rem; color: #0f172a; font-weight: 800; }
.subtitle { margin: 4px 0 0; font-size: 0.95rem; color: #64748b; }

.info-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  padding: 12px 16px;
  border-radius: 14px;
  max-width: 450px;
}

.info-badge p { margin: 0; font-size: 0.85rem; color: #0369a1; line-height: 1.4; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  background: #f8fafc;
  border-radius: 20px;
  border: 2px dashed #e2e8f0;
  color: #64748b;
  gap: 16px;
}

.spinner { 
  width: 32px; height: 32px; 
  border: 3px solid #cbd5e1; border-top-color: #0ea5e9; 
  border-radius: 50%; animation: spin 1s infinite linear; 
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>