<template>
  <div class="rep-infractores-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Gestión</p>
        <h1>Vínculo con representante</h1>
        <p class="subtitle">
          Administra los vínculos entre adolescentes y representantes.
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
      <RepInfractoresToolbar
        v-model:adolescente-id="searchAdolescenteId"
        v-model:representante-id="searchRepresentanteId"
        :can-edit="canEdit"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">
        <div class="spinner"></div>
        <span>Cargando vínculos...</span>
      </div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <RepInfractoresTable
        v-else
        :items="items"
        :can-edit="canEdit"
        @edit="openEdit"
        @remove="removeItem"
      />

      <RepInfractoresPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="totalItems"
        @update:page="currentPage = $event"
        @update:size="pageSize = $event"
      />
    </section>

    <RepInfractoresFormModal
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
  createRepInfractor,
  deleteRepInfractor,
  getRepInfractores,
  updateRepInfractor,
} from "@/service/rep-infractores.service";
import { puedeEditar } from "@/utils/permisos";

import RepInfractoresToolbar from "./components/RepInfractoresToolbar.vue";
import RepInfractoresTable from "./components/RepInfractoresTable.vue";
import RepInfractoresPagination from "./components/RepInfractoresPagination.vue";
import RepInfractoresFormModal from "./components/RepInfractoresFormModal.vue";

const items = ref([]);
const totalItems = ref(0);
const totalPages = ref(1);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const searchAdolescenteId = ref(null);
const searchRepresentanteId = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);

const canEdit = computed(() => puedeEditar("/rep-infractores"));

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
  adolescenteId: Number(row?.adolescente?.id ?? row?.adolescenteId ?? 0) || null,
  representanteId: Number(row?.representante?.id ?? row?.representanteId ?? 0) || null,
  adolescente: row?.adolescente ?? null,
  representante: row?.representante ?? null,
  fechaInicio: row?.fechaInicio ?? null,
  fechaFin: row?.fechaFin ?? null,
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
    const res = await getRepInfractores({
      adolescenteId: searchAdolescenteId.value || undefined,
      representanteId: searchRepresentanteId.value || undefined,
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
    console.error("Error cargando vínculos:", error);
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
      await createRepInfractor(payload);
    } else {
      await updateRepInfractor(editingId.value, payload);
    }
    await loadItems();
    closeModal();
  } catch (error) {
    console.error("Error guardando vínculo:", error);
    alert("No se pudo procesar la solicitud.");
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (row) => {
  if (!canEdit.value) return;
  if (!confirm(`¿Eliminar vínculo #${row.id}?`)) return;
  try {
    await deleteRepInfractor(row.id);
    if (items.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1;
    } else {
      await loadItems();
    }
  } catch (error) {
    console.error("Error eliminando vínculo:", error);
    alert("No se pudo eliminar el registro.");
  }
};

watch([searchAdolescenteId, searchRepresentanteId], () => {
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
.rep-infractores-page {
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
