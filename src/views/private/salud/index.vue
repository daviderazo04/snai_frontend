<template>
  <div class="salud-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catálogos</p>
        <h1>Salud</h1>
        <p class="subtitle">
          Administra los registros de salud asociados a adolescentes.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total Base</span>
          <strong>{{ totalItems }}</strong>
          <span class="hint">Registros cargados</span>
        </div>
        <div class="stat-card">
          <span class="label">Filtrados</span>
          <strong>{{ filteredItems.length }}</strong>
          <span class="hint">Coincidencias encontradas</span>
        </div>
        <div class="stat-card">
          <span class="label">Paginación</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
          <span class="hint">Vista activa</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <SaludToolbar
        v-model:searchNombre="searchNombre"
        v-model:diagnostico="diagnostico"
        v-model:discapacidad="discapacidad"
        :can-edit="canEdit"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">
        <div class="spinner"></div>
        <span>Cargando registros...</span>
      </div>
      
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <SaludTable
        v-else
        :items="items"
        :can-edit="canEdit"
        @view="goToDetail"
        @edit="openEdit"
        @remove="removeItem"
      />

      <SaludPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="totalItems"
        @update:page="currentPage = $event"
      />
    </section>

    <SaludFormModal
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
import { useRouter } from "vue-router";
import {
  getSalud,
  createSalud,
  updateSalud,
  deleteSalud,
} from "@/service/salud.service.js";
import { puedeEditar } from "@/utils/permisos";

import SaludToolbar from "./components/SaludToolbar.vue";
import SaludTable from "./components/SaludTable.vue";
import SaludPagination from "./components/SaludPagination.vue";
import SaludFormModal from "./components/SaludFormModal.vue";

const router = useRouter();

/* ======================
   STATE & FILTERS
====================== */
const items = ref([]);
const totalItems = ref(0);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

// Variables de búsqueda solicitadas
const searchNombre = ref(null);
const diagnostico = ref("");
const discapacidad = ref(""); // Almacenará "1", "0" o ""

const currentPage = ref(1);
const pageSize = ref(100); // Traemos una cantidad alta para que el filtro frontal sea útil
const totalPages = ref(1);

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);
const canEdit = computed(() => puedeEditar("/salud"));

// Para métricas y tabla, usamos directamente los items cargados
const filteredItems = computed(() => items.value);

/* ======================
   HELPERS & MAPPING
====================== */
const normalize01 = (v, fallback = "0") => {
  const s = v === 1 || v === true ? "1" : v === 0 || v === false ? "0" : String(v ?? "");
  return s === "1" || s === "0" ? s : fallback;
};

const mapItem = (row) => {
  const rawId = row?.id ?? row?.saludId;
  const nombres = row?.adolescente?.nombre ?? "";
  const apellidos = row?.adolescente?.apellido ?? "";
  const fullName = `${nombres} ${apellidos}`.trim();

  return {
    id: Number(rawId),
    adolescenteId: Number(row?.adolescente?.id || row?.adolescenteId || 0),
    adolescenteNombre: fullName || "Adolescente #" + (row?.adolescenteId || "?"),
    fecha: row?.fecha ?? "",
    diagnostico: row?.diagnostico ?? "",
    tomaMedicacion: normalize01(row?.tomaMedicacion, "0"),
    consumeSustancia: normalize01(row?.consumeSustancia, "0"),
    tipoSustancia: row?.tipoSustancia ?? "",
    numAtenMedica: Number(row?.numAtenMedica ?? 0),
    discapacidad: normalize01(row?.discapacidad, "0"),
    observacion: row?.observacion ?? "",
  };
};

const unwrap = (res) => (res && "data" in res ? res.data : res);

const parsePaginated = (payload) => {
  const data = payload?.data || payload || [];
  const list = Array.isArray(data) ? data : (data.data || []);
  return { 
    list, 
    totalPages: payload?.totalPages || 1, 
    total: payload?.total || list.length 
  };
};

/* ======================
   METHODS
====================== */
const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getSalud({
      page: currentPage.value,
      size: pageSize.value,
      adolescenteId: searchNombre.value || undefined,
      diagnostico: diagnostico.value || undefined,
      discapacidad: discapacidad.value || undefined,
    });
    const payload = unwrap(res);
    const { list, totalPages: tp, total } = parsePaginated(payload);
    
    items.value = list.map(mapItem);
    totalPages.value = tp || 1;
    totalItems.value = total ?? items.value.length;
  } catch (e) {
    console.error("Error:", e);
    errorMessage.value = "No se pudo sincronizar la información.";
  } finally {
    isLoading.value = false;
  }
};

const goToDetail = (item) => router.push({ name: 'saludDetalle', params: { id: item.id } });

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
      await createSalud(payload);
    } else {
      await updateSalud(editingId.value, payload);
    }
    await loadItems();
    closeModal();
  } catch (e) {
    console.error(e);
    alert("Error al procesar la solicitud.");
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (row) => {
  if (!canEdit.value) return;
  if (!confirm(`¿Eliminar registro #${row.id}?`)) return;
  try {
    await deleteSalud(row.id);
    items.value = items.value.filter((i) => i.id !== row.id);
  } catch (e) {
    alert("Error al eliminar.");
  }
};

const reloadFilters = () => {
  currentPage.value = 1;
  loadItems();
};

watch([searchNombre, diagnostico, discapacidad], reloadFilters);

onMounted(loadItems);
</script>

<style scoped>
/* Los estilos se mantienen igual a tu versión original */
.salud-page { display: flex; flex-direction: column; gap: 24px; }
.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white; padding: 28px; border-radius: 20px; position: relative; overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}
.hero-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 20px; }
.stat-card {
  background: rgba(255, 255, 255, 0.12); border-radius: 16px; padding: 14px 16px;
  backdrop-filter: blur(6px); display: flex; flex-direction: column; gap: 6px;
}
.panel {
  display: flex; flex-direction: column; gap: 18px; background: white; padding: 22px;
  border-radius: 18px; border: 1px solid #e2e8f0;
}
.status { padding: 60px; text-align: center; background: #f8fafc; border-radius: 12px; }
.spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
