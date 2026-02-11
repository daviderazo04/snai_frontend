<template>
  <div class="provincias-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catálogos</p>
        <h1>Ocupación</h1>
        <p class="subtitle">
          Administra el catálogo de ocupaciones utilizadas en los formularios del sistema.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalItems }}</strong>
          <span class="hint">Ocupaciones registradas</span>
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
     <OcupacionToolbar
       :search="search"
       :total="totalItems"
       :can-edit="canEdit"
       @update:search="search = $event"
       @create="openCreate"
      />

      <div v-if="isLoading" class="status">Cargando ocupaciones...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <OcupacionTable :items="items" :can-edit="canEdit" @edit="openEdit" @remove="removeItem" />

      <OcupacionPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="totalItems"
        @update:page="currentPage = $event"
      />
    </section>

    <OcupacionFormModal
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
  getOcupaciones,
  createOcupacion,
  updateOcupacion,
  deleteOcupacion,
} from "@/service/ocupacion.service";
import { puedeEditar } from "@/utils/permisos";

import OcupacionToolbar from "./components/OcupacionToolbar.vue";
import OcupacionTable from "./components/OcupacionTable.vue";
import OcupacionPagination from "./components/OcupacionPagination.vue";
import OcupacionFormModal from "./components/OcupacionFormModal.vue";

/* ======================
   STATE
====================== */
const items = ref([]);
const totalItems = ref(0);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const search = ref("");
const currentPage = ref(1);
const pageSize = ref(6);
const totalPages = ref(1);
const adolescenteId = ref("");

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);
const canEdit = computed(() => puedeEditar("/ocupacion"));

/* ======================
   COMPUTED
====================== */
const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase();
  return items.value.filter((i) => !term || `${i.nombre} ${i.id}`.toLowerCase().includes(term));
});

const visibleCount = computed(() => items.value.length);

/* ======================
   METHODS
====================== */
const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getOcupaciones({
      termino: search.value || undefined,
      adolescenteId: adolescenteId.value || undefined,
      page: currentPage.value,
      size: pageSize.value,
    });

    const payload = res?.data ?? res;
    const data = payload?.data ?? payload;

    const list =
      (Array.isArray(data) ? data : null) ??
      (Array.isArray(data?.data) ? data.data : null) ??
      (Array.isArray(payload?.items) ? payload.items : null) ??
      [];

    const tp =
      Number(payload?.totalPages ?? payload?.data?.totalPages ?? data?.totalPages) || 1;
    const total =
      Number(payload?.total ?? payload?.data?.total ?? data?.total ?? payload?.totalItems) ||
      list.length;

    items.value = list;
    totalPages.value = Math.max(1, tp);
    totalItems.value = total;

    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
    if (currentPage.value < 1) currentPage.value = 1;
  } catch (e) {
    errorMessage.value = e?.response?.data?.message || e?.message || "No se pudo cargar ocupaciones.";
    items.value = [];
    totalPages.value = 1;
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

/* ======================
   WATCHERS
====================== */
watch(search, () => {
  currentPage.value = 1;
  loadItems();
});

watch(totalPages, (val) => {
  if (currentPage.value > val) currentPage.value = val;
});

watch(currentPage, loadItems);

const openCreate = () => {
  if (!canEdit.value) return;
  modalMode.value = "create";
  modalInitial.value = null;
  editingId.value = null;
  modalOpen.value = true;
};

const openEdit = (item) => {
  if (!canEdit.value) return;
  modalMode.value = "edit";
  modalInitial.value = { ...item };
  editingId.value = item.id;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  modalInitial.value = null;
  editingId.value = null;
};

const saveItem = async ({ nombre }) => {
  if (!canEdit.value) return;
  const clean = nombre ? String(nombre).trim() : "";
  if (!clean) return;

  isSaving.value = true;
  errorMessage.value = "";

  try {
    const payload = { nombre: clean, adolescenteId: adolescenteId.value || undefined };
    if (modalMode.value === "create") {
      await createOcupacion(payload);
    } else {
      await updateOcupacion(editingId.value, payload);
    }
    await loadItems();
    closeModal();
  } catch (e) {
    errorMessage.value = e?.response?.data?.message || e?.message || "Error guardando ocupación.";
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (item) => {
  if (!canEdit.value) return;
  if (!confirm(`Eliminar la ocupación "${item.nombre}"?`)) return;

  errorMessage.value = "";
  try {
    await deleteOcupacion(item.id);
    const isLastItemOnPage = items.value.length === 1 && currentPage.value > 1;
    if (isLastItemOnPage) {
      currentPage.value -= 1;
    } else {
      await loadItems();
    }
  } catch (e) {
    errorMessage.value = e?.response?.data?.message || e?.message || "No se pudo eliminar la ocupación.";
  }
};

onMounted(loadItems);
</script>

<style scoped>
.provincias-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white;
  padding: 28px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.hero::before {
  width: 220px;
  height: 220px;
  top: -60px;
  right: -40px;
}

.hero::after {
  width: 140px;
  height: 140px;
  bottom: -50px;
  left: 40px;
}

.hero-main {
  position: relative;
  z-index: 1;
  max-width: 540px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.7rem;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.7);
}

.hero-main h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  font-size: 0.98rem;
  color: rgba(255, 255, 255, 0.85);
}

.hero-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 14px 16px;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-card strong {
  font-size: 1.4rem;
}

.label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
}

.hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: white;
  padding: 22px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.status {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.92rem;
}

.status.error {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

@media (max-width: 720px) {
  .hero {
    padding: 22px;
  }

  .hero-main h1 {
    font-size: 1.6rem;
  }
}
</style>
