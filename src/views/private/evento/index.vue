<template>
  <div class="evento-page">
    
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catálogos</p>
        <h1>Eventos</h1>
        <p class="subtitle">
          Administra el catálogo de eventos utilizado en el sistema.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalItems }}</strong>
          <span class="hint">Eventos registrados</span>
        </div>

        <div class="stat-card">
          <span class="label">En esta página</span>
          <strong>{{ visibleCount }}</strong>
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
      <EventoToolbar
        :search="search"
        :total="totalItems"
        @update:search="search = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">
        <div class="spinner"></div>
        <span>Cargando eventos...</span>
      </div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <EventoTable
        v-else
        :items="items"
        @edit="openEdit"
        @remove="removeItem"
      />

      <EventoPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:page="currentPage = $event"
      />
    </section>

    <EventoFormModal
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
import {
  getEventos,
  createEvento,
  updateEvento,
  deleteEvento,
} from "../../../service/evento.service";

import EventoToolbar from "./components/EventoToolbar.vue";
import EventoTable from "./components/EventoTable.vue";
import EventoPagination from "./components/EventoPagination.vue";
import EventoFormModal from "./components/EventoFormModal.vue";

const unwrap = (maybeAxiosResponse) => {
  if (maybeAxiosResponse && typeof maybeAxiosResponse === "object" && "data" in maybeAxiosResponse) {
    return maybeAxiosResponse.data;
  }
  return maybeAxiosResponse;
};

const parsePaginated = (payload) => {
  const top = payload || {};
  const inner = top.data && typeof top.data === "object" && !Array.isArray(top.data) ? top.data : null;

  const list =
    (Array.isArray(top.data) ? top.data : null) ??
    (Array.isArray(inner?.data) ? inner.data : null) ??
    (Array.isArray(inner?.items) ? inner.items : null) ??
    (Array.isArray(top.items) ? top.items : null) ??
    [];

  const rawTotalPages =
    top.totalPages ?? inner?.totalPages ?? inner?.last_page ?? inner?.lastPage ?? inner?.total_pages;
  const totalPages = Math.max(1, Number(rawTotalPages) || 1);

  const rawTotal =
    top.total ?? inner?.total ?? inner?.totalRecords ?? inner?.totalElements ?? inner?.total_items;
  const total = Number(rawTotal) || list.length;

  return { list, totalPages, total };
};

const mapItem = (row) => {
  const rawId = row?.id ?? row?.eventoId ?? row?.idEvento;
  const idNum = Number(rawId);
  const texto = row?.nombre ?? row?.descripcion ?? row?.name ?? "";

  return {
    id: Number.isNaN(idNum) ? rawId : idNum,
    nombre: texto,
    descripcion: texto,
  };
};

const items = ref([]);
const totalItems = ref(0);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const search = ref("");
const currentPage = ref(1);
const pageSize = ref(6);
const totalPages = ref(1);

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);

const visibleCount = computed(() => items.value.length);

const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getEventos({
      nombre: search.value,
      page: currentPage.value,
      size: pageSize.value,
    });

    const payload = unwrap(res);
    const { list, totalPages: tp, total } = parsePaginated(payload);

    items.value = list.map(mapItem);
    totalPages.value = tp || 1;
    totalItems.value = total ?? items.value.length;

    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
    if (currentPage.value < 1) currentPage.value = 1;
  } catch (e) {
    console.error("Error cargando eventos:", e);
    errorMessage.value =
      e?.response?.data?.message || e?.message || "No se pudo cargar eventos.";
    items.value = [];
    totalPages.value = 1;
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

watch(search, () => {
  currentPage.value = 1;
  loadItems();
});
watch(currentPage, loadItems);
watch(totalPages, (val) => {
  if (currentPage.value > val) currentPage.value = val;
});

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
      const res = await createEvento({ nombre });
      if (res?.data?.success === false) throw new Error(res?.data?.message || "No se pudo guardar.");
    } else {
      if (editingId.value == null) return;
      const res = await updateEvento(editingId.value, { nombre });
      if (res?.data?.success === false) throw new Error(res?.data?.message || "No se pudo guardar.");
    }
    await loadItems();
    closeModal();
  } catch (e) {
    console.error("Error guardando evento:", e);
    errorMessage.value = e?.response?.data?.message || e?.message || "Error guardando el evento.";
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (row) => {
  if (!confirm(`¿Eliminar el evento "${row.nombre}"?`)) return;

  try {
    const res = await deleteEvento(row.id);
    if (res?.data?.success === false) {
      throw new Error(res?.data?.message || "No se pudo eliminar el evento.");
    }
    const message = res?.data?.message || "Éxito";
    const isLastItemOnPage = items.value.length === 1 && currentPage.value > 1;
    if (isLastItemOnPage) {
      currentPage.value -= 1;
    } else {
      await loadItems();
    }
    alert(message);
  } catch (e) {
    console.error("Error eliminando evento:", e);
    const msg = e?.response?.data?.message || e?.message || "No se pudo eliminar el evento.";
    alert(msg);
  }
};

onMounted(loadItems);
</script>

<style scoped>
.evento-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hero Section */
.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white;
  padding: 32px;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.hero::before { width: 300px; height: 300px; top: -100px; right: -50px; }
.hero::after { width: 180px; height: 180px; bottom: -40px; left: 40px; }

.hero-main {
  position: relative;
  z-index: 1;
  max-width: 500px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75rem;
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.hero-main h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 800;
}

.subtitle {
  margin: 0;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Stats */
.hero-stats {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 20px;
  border-radius: 16px;
  min-width: 130px;
  display: flex;
  flex-direction: column;
}

.stat-card .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.stat-card strong {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-card .hint {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 2px;
}

/* Panel */
.panel {
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Status & Spinner */
.status {
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
}

.status.error {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 860px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .hero-stats {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}
</style>
