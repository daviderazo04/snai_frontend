<template>
  <div class="module-wrap">
    <PerfilToolbar 
      :search="search"
      @update:search="search = $event"
      @create="openModal('create')"
    />

    <div v-if="loading" class="status">
      <div class="spinner"></div>
      <span>Cargando perfiles...</span>
    </div>

    <PerfilTable 
      v-else 
      :items="items" 
      @edit="openModal('edit', $event)" 
    />

    <PerfilFormModal 
      :open="showModal" 
      :mode="mode" 
      :initial-data="selected" 
      :saving="saving"
      @close="showModal = false" 
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
    const res = await getPerfiles({ nombre: search.value, size: 50 });
    items.value = res.data.data || [];
  } finally { loading.value = false; }
};

watch(search, load);
onMounted(load);

const openModal = (m, item) => {
  mode.value = m;
  selected.value = item ? {...item} : null;
  showModal.value = true;
};

const handleSave = async (payload) => {
  saving.value = true;
  try {
    const res = mode.value === 'create' 
      ? await createPerfil(payload) 
      : await updatePerfil(selected.value.id, payload);
    if(res.data.success) { showModal.value = false; load(); }
    else alert(res.data.message);
  } catch(e) { console.error(e); } finally { saving.value = false; }
};
</script>

<style scoped>
.module-wrap { display: flex; flex-direction: column; gap: 20px; }
.status { padding: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; background: #f8fafc; border-radius: 16px; border: 1px dashed #cbd5e1; }
.spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>