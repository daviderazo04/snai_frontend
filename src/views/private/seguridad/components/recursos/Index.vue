<template>
  <div class="module-wrap">
    <div class="info-card">
      <h3>Endpoints del Sistema</h3>
      <p>Estos son los recursos detectados automáticamente. No se pueden editar, pero se usan para configurar los permisos de los perfiles.</p>
    </div>
    <div v-if="loading" class="status"><div class="spinner"></div></div>
    <RecursoTable v-else :items="items" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSystemEndpoints } from '@/service/users-roles.service.js';
import RecursoTable from './RecursoTable.vue';
const items = ref([]);
const loading = ref(false);
onMounted(async () => {
  loading.value = true;
  try { const res = await getSystemEndpoints(); items.value = res.data; } finally { loading.value = false; }
});
</script>

<style scoped>
.module-wrap { display: flex; flex-direction: column; gap: 20px; }
.info-card { background: #eff6ff; border: 1px solid #dbeafe; padding: 16px; border-radius: 12px; color: #1e40af; }
.info-card h3 { margin: 0 0 4px; font-size: 1rem; }
.status { padding: 40px; display: flex; justify-content: center; }
.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>