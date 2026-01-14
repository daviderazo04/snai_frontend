<template>
  <div class="delito-page">
    
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catálogos</p>
        <h1>Delitos</h1>
        <p class="subtitle">
          Administra el catálogo de delitos e infracciones del sistema.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalItems }}</strong>
          <span class="hint">Delitos registrados</span>
        </div>

        <div class="stat-card">
          <span class="label">Visibles</span>
          <strong>{{ filteredCount }}</strong>
          <span class="hint">Resultado del filtro</span>
        </div>

        <div class="stat-card">
          <span class="label">Página</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
          <span class="hint">Paginación activa</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <DelitoToolbar
        :search="search"
        :total="filteredCount"
        @update:search="search = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">
        <div class="spinner"></div>
        <span>Cargando delitos...</span>
      </div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <DelitoTable
        v-else
        :items="pagedItems"
        @edit="openEdit"
        @remove="removeItem"
      />

      <DelitoPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:page="currentPage = $event"
      />
    </section>

    <DelitoFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="modalInitial"
      :saving="isSaving"
      @close="closeModal"
      @save="saveItem"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
// Importa el servicio desde donde lo tengas
import {
  getDelitos,
  createDelito,
  updateDelito,
  deleteDelito,
} from "../../../service/delito.service";

import DelitoToolbar from "./components/DelitoToolbar.vue";
import DelitoTable from "./components/DelitoTable.vue";
import DelitoPagination from "./components/DelitoPagination.vue";
import DelitoFormModal from "./components/DelitoFormModal.vue";

// Función auxiliar para extraer datos de la respuesta
const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const items = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const search = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);

// Filtro Frontend (si el backend no filtra, o para inmediatez)
const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return items.value;
  return items.value.filter((i) => {
    const haystack = `${i.nombre} ${i.id}`.toLowerCase();
    return haystack.includes(term);
  });
});

const filteredCount = computed(() => filteredItems.value.length);
const totalItems = computed(() => items.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCount.value / pageSize.value)));

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredItems.value.slice(start, start + pageSize.value);
});

watch(search, () => (currentPage.value = 1));

const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getDelitos();
    items.value = resolveList(res);
  } catch (e) {
    console.error("Error cargando delitos:", e);
    errorMessage.value = "No se pudo cargar delitos.";
    items.value = [];
  } finally {
    isLoading.value = false;
  }
};

const openCreate = () => {
  modalMode.value = "create";
  modalInitial.value = null;
  editingId.value = null;
  modalOpen.value = true;
};

const openEdit = (row) => {
  modalMode.value = "edit";
  modalInitial.value = { ...row };
  editingId.value = row.id;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  modalInitial.value = null;
  editingId.value = null;
};

const saveItem = async (payload) => {
  const nombre = payload?.nombre ? String(payload.nombre).trim() : "";
  if (!nombre) return;

  isSaving.value = true;
  errorMessage.value = "";

  try {
    if (modalMode.value === "create") {
      const res = await createDelito({ nombre });
      // Si la respuesta trae el objeto creado, lo agregamos
      const saved = res?.data?.data ?? res?.data;
      if (saved?.id) items.value.push(saved);
      else await loadItems();
    } else {
      if (!editingId.value) return;
      const res = await updateDelito(editingId.value, { nombre });
      const saved = res?.data?.data ?? res?.data;
      
      if (saved?.id) {
        const idx = items.value.findIndex(i => i.id === editingId.value);
        if (idx !== -1) items.value[idx] = saved;
      } else {
        await loadItems();
      }
    }
    closeModal();
  } catch (e) {
    console.error("Error guardando delito:", e);
    errorMessage.value = "Error al guardar el delito.";
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (row) => {
  if (!confirm(`¿Eliminar el delito "${row.nombre}"?`)) return;
  try {
    await deleteDelito(row.id);
    items.value = items.value.filter((i) => i.id !== row.id);
  } catch (e) {
    console.error("Error eliminando delito:", e);
    alert("No se pudo eliminar el registro.");
  }
};

onMounted(loadItems);
</script>

<style scoped>
.delito-page { display: flex; flex-direction: column; gap: 24px; }

/* Hero Section */
.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white; padding: 32px; border-radius: 24px; position: relative;
  overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
  display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: space-between;
}
.hero::before, .hero::after {
  content: ""; position: absolute; border-radius: 999px; background: rgba(255, 255, 255, 0.08); pointer-events: none;
}
.hero::before { width: 300px; height: 300px; top: -100px; right: -50px; }
.hero::after { width: 180px; height: 180px; bottom: -40px; left: 40px; }

.hero-main { position: relative; z-index: 1; max-width: 500px; }
.eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 0.75rem; margin: 0 0 10px; color: rgba(255, 255, 255, 0.8); font-weight: 600; }
.hero-main h1 { margin: 0 0 8px; font-size: 2rem; font-weight: 800; }
.subtitle { margin: 0; font-size: 1.05rem; color: rgba(255, 255, 255, 0.9); }

/* Stats */
.hero-stats { display: flex; gap: 12px; position: relative; z-index: 1; }
.stat-card {
  background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 20px; border-radius: 16px; min-width: 130px; display: flex; flex-direction: column;
}
.stat-card .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 4px; }
.stat-card strong { font-size: 1.5rem; font-weight: 700; }
.stat-card .hint { font-size: 0.75rem; opacity: 0.7; margin-top: 2px; }

/* Panel */
.panel {
  background: white; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05); display: flex; flex-direction: column; gap: 20px;
}

/* Status & Spinner */
.status {
  padding: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #64748b; background: #f8fafc; border-radius: 16px; border: 1px dashed #cbd5e1;
}
.status.error { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
.spinner {
  width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 860px) {
  .hero { flex-direction: column; align-items: flex-start; }
  .hero-stats { width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
}
</style>