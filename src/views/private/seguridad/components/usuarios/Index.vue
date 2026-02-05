<template>
  <div class="module-wrap">
    <UsuarioToolbar 
      :search="search"
      @update:search="search = $event"
      @create="openCreate"
    />

    <div v-if="loading" class="status">
      <div class="spinner"></div>
      <span>Cargando usuarios...</span>
    </div>

    <UsuarioTable 
      v-else 
      :items="items" 
      @assign="openAssign" 
    />

    <div class="pagination">
      <button :disabled="page===1" @click="page--">Anterior</button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button :disabled="page>=totalPages" @click="page++">Siguiente</button>
    </div>

    <UsuarioFormModal 
      :open="showCreate" 
      :saving="saving" 
      @close="showCreate = false" 
      @save="handleCreate" 
    />

    <RolAsignarModal 
      :open="showAssign" 
      :user="selectedUser" 
      :saving="saving" 
      @close="showAssign = false" 
      @save="handleAssign" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getUsuarios, register, asignarPerfilUsuario } from '@/service/users-roles.service.js';
import UsuarioToolbar from './UsuarioToolbar.vue';
import UsuarioTable from './UsuarioTable.vue';
import UsuarioFormModal from './UsuarioFormModal.vue';
import RolAsignarModal from './RolAsignarModal.vue';

const items = ref([]);
const search = ref('');
const page = ref(1);
const totalPages = ref(1);
const loading = ref(false);
const saving = ref(false);

const showCreate = ref(false);
const showAssign = ref(false);
const selectedUser = ref(null);

const load = async () => {
  loading.value = true;
  try {
    const res = await getUsuarios({ nombre: search.value, page: page.value, size: 10 });
    // Ajustado a tu JSON { data: [...], totalPages: 1 }
    items.value = res.data.data || [];
    totalPages.value = res.data.totalPages || 1;
  } finally { loading.value = false; }
};

watch([search, page], load);
onMounted(load);

const openCreate = () => showCreate.value = true;
const handleCreate = async (payload) => {
  saving.value = true;
  try {
    const res = await register(payload);
    if(res.data.success) { showCreate.value = false; load(); }
    else alert(res.data.message);
  } catch(e) { console.error(e); } finally { saving.value = false; }
};

const openAssign = (user) => { selectedUser.value = user; showAssign.value = true; };
const handleAssign = async ({userId, roleIds}) => {
  saving.value = true;
  try {
    const res = await asignarPerfilUsuario(userId, roleIds);
    if(res.data.success) { showAssign.value = false; alert('Roles asignados correctamente'); }
  } catch(e) { console.error(e); } finally { saving.value = false; }
};
</script>

<style scoped>
.module-wrap { display: flex; flex-direction: column; gap: 20px; }
/* Estilos compartidos copiados de Educación */
.status { padding: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; background: #f8fafc; border-radius: 16px; border: 1px dashed #cbd5e1; }
.spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px; }
.pagination button { border: 1px solid #e2e8f0; background: white; padding: 8px 14px; border-radius: 12px; cursor: pointer; font-weight: 700; color: #0f172a; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>