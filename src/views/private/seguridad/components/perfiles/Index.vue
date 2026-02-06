<template>
  <div class="module-wrap">
    <PerfilToolbar 
      :search="search"
      @update:search="search = $event"
      @create="openModal('create')"
    />

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Consultando perfiles de acceso...</p>
    </div>

    <PerfilTable 
      v-else 
      :items="items" 
      @edit="openModal('edit', $event)" 
    />

    <PerfilFormModal 
      v-if="showModal"
      :open="showModal" 
      :mode="mode" 
      :initial-data="selected" 
      :saving="saving"
      @close="closeModal" 
      @save="handleSave" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getPerfiles, createPerfil, updatePerfil } from '@/service/users-roles.service.js';
import PerfilToolbar from './PerfilToolbar.vue';
import PerfilTable from './PerfilTable.vue';
import PerfilFormModal from './PerfilFormModal.vue';

const items = ref([]);
const search = ref('');
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const mode = ref('create');
const selected = ref(null);

const load = async () => {
  loading.value = true;
  try {
    const res = await getPerfiles({ nombre: search.value, page: 1, size: 50 });
    items.value = res.data?.data || [];
  } catch (e) {
    console.error("Error cargando perfiles:", e);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

watch(search, load);
onMounted(load);

const openModal = (m, item = null) => {
  mode.value = m;
  selected.value = m === 'edit' ? item : null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selected.value = null;
};

const handleSave = async (payload) => {
  saving.value = true;
  try {
    const res = (mode.value === 'create')
      ? await createPerfil(payload)
      : await updatePerfil(selected.value.id, payload);

    if (res.data?.success) {
      closeModal();
      await load();
    } else {
      alert(res.data?.message || 'Error procesando la solicitud');
    }
  } catch (e) {
    console.error(e);
    alert(e?.response?.data?.message || 'Error de conexión con el servidor');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.module-wrap { display: flex; flex-direction: column; gap: 24px; }
.loading-container { padding: 80px; text-align: center; background: #f8fafc; border-radius: 24px; border: 2px dashed #e2e8f0; color: #64748b; }
.spinner { width: 32px; height: 32px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s infinite linear; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
