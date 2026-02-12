<template>
  <div class="representantes-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Gestión</p>
        <h1>Representantes</h1>
        <p class="subtitle">
          Administra representantes con filtros por nombre y cédula.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total estimado</span>
          <strong>{{ totalItems }}</strong>
          <span class="hint">Según paginación</span>
        </div>
        <div class="stat-card">
          <span class="label">En página</span>
          <strong>{{ items.length }}</strong>
          <span class="hint">Resultados actuales</span>
        </div>
        <div class="stat-card">
          <span class="label">Página</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
          <span class="hint">Vista activa</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <RepresentanteToolbar
        v-model:nombre="searchNombre"
        v-model:cedula="searchCedula"
        :can-edit="canEdit"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">
        <div class="spinner"></div>
        <span>Cargando representantes...</span>
      </div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <RepresentanteTable
        v-else
        :items="items"
        :can-edit="canEdit"
        @edit="openEdit"
        @remove="removeItem"
      />

      <RepresentantePagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="totalItems"
        @update:page="currentPage = $event"
        @update:size="pageSize = $event"
      />
    </section>

    <RepresentanteFormModal
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
import { computed, onMounted, ref, watch } from "vue";
import {
  createRepresentante,
  deleteRepresentante,
  getRepresentantes,
  updateRepresentante,
} from "@/service/representante.service";
import { puedeEditar } from "@/utils/permisos";

import RepresentanteToolbar from "./components/RepresentanteToolbar.vue";
import RepresentanteTable from "./components/RepresentanteTable.vue";
import RepresentantePagination from "./components/RepresentantePagination.vue";
import RepresentanteFormModal from "./components/RepresentanteFormModal.vue";

const items = ref([]);
const totalItems = ref(0);
const totalPages = ref(1);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const searchNombre = ref("");
const searchCedula = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);

const canEdit = computed(() => puedeEditar("/representantes"));

const unwrap = (res) => {
  if (res && typeof res === "object" && "data" in res) return res.data;
  return res;
};

const parsePaginated = (payload) => {
  const top = payload || {};
  const list = Array.isArray(top?.data)
    ? top.data
    : Array.isArray(top)
      ? top
      : Array.isArray(top?.data?.data)
        ? top.data.data
        : [];

  const parsedTotalPages = Number(top?.totalPages ?? top?.data?.totalPages ?? 1);
  const parsedPage = Number(top?.page ?? top?.data?.page ?? currentPage.value);
  const parsedPageSize = Number(top?.pageSize ?? top?.data?.pageSize ?? pageSize.value);
  const parsedTotal = Number(top?.total ?? top?.data?.total ?? top?.totalItems ?? top?.data?.totalItems);

  return {
    list,
    totalPages: Number.isFinite(parsedTotalPages) && parsedTotalPages > 0 ? parsedTotalPages : 1,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : currentPage.value,
    pageSize: Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : pageSize.value,
    total: Number.isFinite(parsedTotal) && parsedTotal >= 0 ? parsedTotal : null,
  };
};

const mapItem = (row) => ({
  id: Number(row?.id ?? 0),
  nacionalidadId: Number(row?.nacionalidad?.id ?? row?.nacionalidadId ?? 0),
  nacionalidadNombre: row?.nacionalidad?.nombre ?? row?.nacionalidadNombre ?? "—",
  parentescoId: Number(row?.parentesco?.id ?? row?.parentescoId ?? 0),
  parentescoNombre: row?.parentesco?.nombre ?? row?.parentescoNombre ?? "—",
  cantonId: Number(row?.canton?.id ?? row?.cantonId ?? 0),
  cantonNombre: row?.canton?.nombre ?? row?.cantonNombre ?? "—",
  nombre: row?.nombre ?? "",
  apellido: row?.apellido ?? "",
  cedula: row?.cedula ?? "",
});

const estimateTotal = (rows, tp, ps) => {
  if (tp <= 1) return rows.length;
  if (currentPage.value === tp) return (tp - 1) * ps + rows.length;
  return tp * ps;
};

const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getRepresentantes({
      nombre: searchNombre.value || undefined,
      cedula: searchCedula.value || undefined,
      page: currentPage.value,
      size: pageSize.value,
    });

    const payload = unwrap(res);
    const parsed = parsePaginated(payload);

    items.value = parsed.list.map(mapItem);
    totalPages.value = parsed.totalPages;
    currentPage.value = Math.min(Math.max(parsed.page, 1), totalPages.value);
    pageSize.value = parsed.pageSize;
    totalItems.value = parsed.total ?? estimateTotal(items.value, parsed.totalPages, parsed.pageSize);
  } catch (error) {
    console.error("Error cargando representantes:", error);
    errorMessage.value = "No se pudo sincronizar la información.";
    items.value = [];
    totalPages.value = 1;
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const openCreate = () => {
  if (!canEdit.value) return;
  modalMode.value = "create";
  modalInitial.value = null;
  editingId.value = null;
  modalOpen.value = true;
};

const openEdit = (row) => {
  if (!canEdit.value) return;
  modalMode.value = "edit";
  modalInitial.value = { ...row };
  editingId.value = row.id;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const saveItem = async (payload) => {
  if (!canEdit.value) return;
  isSaving.value = true;
  try {
    if (modalMode.value === "create") {
      await createRepresentante(payload);
    } else {
      await updateRepresentante(editingId.value, payload);
    }
    await loadItems();
    closeModal();
  } catch (error) {
    console.error("Error guardando representante:", error);
    alert("No se pudo procesar la solicitud.");
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (row) => {
  if (!canEdit.value) return;
  if (!confirm(`¿Eliminar representante #${row.id}?`)) return;
  try {
    await deleteRepresentante(row.id);
    if (items.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1;
    } else {
      await loadItems();
    }
  } catch (error) {
    console.error("Error eliminando representante:", error);
    alert("No se pudo eliminar el registro.");
  }
};

watch([searchNombre, searchCedula], () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  loadItems();
});

watch([currentPage, pageSize], () => {
  loadItems();
});

onMounted(loadItems);
</script>

<style scoped>
.representantes-page {
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

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
}

.eyebrow {
  margin: 0;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.75rem;
}

h1 {
  margin: 8px 0 8px;
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
}

.label {
  font-size: 0.75rem;
  opacity: 0.8;
  text-transform: uppercase;
}

strong {
  font-size: 1.5rem;
  line-height: 1.2;
}

.hint {
  font-size: 0.78rem;
  opacity: 0.85;
}

.panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border-radius: 14px;
  background: #f8fafc;
  color: #334155;
}

.status.error {
  background: #fef2f2;
  color: #991b1b;
}

.spinner {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
