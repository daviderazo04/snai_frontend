<template>
  <div class="module-wrap">
    <UsuarioToolbar
      :search="search"
      @update:search="handleSearchUpdate"
      @create="openCreate"
    />

    <div v-if="loading" class="status">
      <div class="spinner"></div>
      <span>Cargando usuarios...</span>
    </div>

    <div v-else>
      <div v-if="errorMessage" class="error-banner">
        <span class="error-icon">⚠️</span>
        <span>{{ errorMessage }}</span>
      </div>

      <UsuarioTable :items="items" @assign="openAssign" />

      <div class="pagination-container">
        <div class="pagination-content">
          <button class="pagi-btn" :disabled="page === 1 || loading" @click="page--">
            Anterior
          </button>
          <div class="page-info">
            Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong>
          </div>
          <button class="pagi-btn" :disabled="page >= totalPages || loading" @click="page++">
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <UsuarioFormModal
      :open="showCreate"
      :saving="saving"
      @close="showCreate = false"
      @save="handleCreate"
    />

    <RolAsignarModal
      v-if="showAssign"
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
import {
  getUsuarios,
  register,
  asignarPerfilUsuario,
  getDetalleUsuario,
} from '@/service/users-roles.service.js';

import UsuarioToolbar from './UsuarioToolbar.vue';
import UsuarioTable from './UsuarioTable.vue';
import UsuarioFormModal from './UsuarioFormModal.vue';
import RolAsignarModal from './RolAsignarModal.vue';

const PAGE_SIZE = 10;

const items = ref([]);
const search = ref('');
const page = ref(1);
const totalPages = ref(1);

const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');

const showCreate = ref(false);
const showAssign = ref(false);
const selectedUser = ref(null);

const unwrap = (maybeAxiosResponse) => {
  // Soporta ambos casos:
  // - Axios: { data: ... }
  // - Data directo: { ... }
  if (maybeAxiosResponse && typeof maybeAxiosResponse === 'object' && 'data' in maybeAxiosResponse) {
    return maybeAxiosResponse.data;
  }
  return maybeAxiosResponse;
};

const parsePaginated = (payload) => {
  // Soporta estructuras típicas:
  // A) { data: [...], totalPages }
  // B) { success, message, data: [...], totalPages }
  // C) { success, message, data: { data: [...], totalPages } }
  const top = payload || {};
  const inner = top.data && typeof top.data === 'object' && !Array.isArray(top.data) ? top.data : null;

  const list =
    (Array.isArray(top.data) ? top.data : null) ??
    (Array.isArray(inner?.data) ? inner.data : null) ??
    [];

  const tp = Number(top.totalPages ?? inner?.totalPages ?? 1) || 1;

  return { list, totalPages: tp };
};

const load = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await getUsuarios({
      nombre: search.value,
      page: page.value,
      size: PAGE_SIZE,
    });

    const payload = unwrap(response);
    const { list, totalPages: tp } = parsePaginated(payload);

    items.value = list;
    totalPages.value = tp;

    // Normaliza página si cambian los resultados (por ejemplo tras buscar)
    if (page.value > totalPages.value) page.value = totalPages.value;
    if (page.value < 1) page.value = 1;
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    items.value = [];
    totalPages.value = 1;
    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'No se pudieron cargar los usuarios.';
  } finally {
    loading.value = false;
  }
};

watch(page, load);
onMounted(load);

const handleSearchUpdate = (val) => {
  search.value = val ?? '';
  page.value = 1;
  load();
};

const openCreate = () => {
  showCreate.value = true;
};

const handleCreate = async (payload) => {
  saving.value = true;
  try {
    const res = await register(payload);
    const data = unwrap(res);

    if (data?.success === false) {
      throw new Error(data?.message || 'No se pudo registrar el usuario.');
    }

    showCreate.value = false;
    await load();
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Error al registrar';
    alert(msg);
  } finally {
    saving.value = false;
  }
};

const openAssign = async (basicUser) => {
  try {
    const res = await getDetalleUsuario(basicUser.id);
    const payload = unwrap(res);

    const success = payload?.success ?? payload?.data?.success ?? true;
    const detalle = payload?.data ?? payload?.data?.data ?? null;

    if (!success || !detalle) {
      alert(payload?.message || 'Error al cargar detalle del usuario');
      return;
    }

    selectedUser.value = detalle;
    showAssign.value = true;
  } catch (error) {
    console.error('Error detalle usuario:', error);
    alert('No se pudo conectar con el servidor.');
  }
};

const handleAssign = async ({ userId, roleIds }) => {
  saving.value = true;
  try {
    const res = await asignarPerfilUsuario(userId, roleIds);
    const payload = unwrap(res);

    const success = payload?.success ?? true;

    if (success) {
      showAssign.value = false;
      alert('Perfiles asignados correctamente');
      await load();
    } else {
      alert(payload?.message || 'No se pudieron asignar los perfiles.');
    }
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Error desconocido';
    alert('Error al asignar: ' + msg);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.module-wrap { display: flex; flex-direction: column; gap: 24px; }

.status {
  padding: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8fafc;
  border-radius: 20px;
  border: 2px dashed #e2e8f0;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #cbd5e1;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #991b1b;
  margin-bottom: 14px;
  font-weight: 600;
}
.error-icon { font-size: 1.1rem; }

.pagination-container {
  margin-top: 10px;
  padding: 12px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.pagination-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.page-info { font-size: 0.95rem; color: #0f172a; }

.pagi-btn {
  padding: 8px 24px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.pagi-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.pagi-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
