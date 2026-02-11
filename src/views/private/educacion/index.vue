<template>
  <div class="educacion-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Gestión</p>
        <h1>Educación</h1>
        <p class="subtitle">
          Administra los registros educativos asociados a adolescentes.
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
          <span class="label">Página</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
          <span class="hint">Vista activa</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <EducacionToolbar
        v-model:search="search"
        v-model:estudia="estudiaFilter"
        v-model:nivel="nivelFilter"
        v-model:institucion="institucionFilter"
        :total="totalItems"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">
        <div class="spinner"></div>
        <span>Cargando registros...</span>
      </div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <EducacionTable
        v-else
        :items="filteredItems"
        @view="goToDetail"
        @edit="openEdit"
        @remove="removeItem"
      />

      <EducacionPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="totalItems"
        @update:page="currentPage = $event"
      />
    </section>

    <EducacionFormModal
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
  getEducaciones,
  createEducacion,
  updateEducacion,
  deleteEducacion,
} from "@/service/educacion.service.js";

import EducacionToolbar from "./components/EducacionToolbar.vue";
import EducacionTable from "./components/EducacionTable.vue";
import EducacionPagination from "./components/EducacionPagination.vue";
import EducacionFormModal from "./components/EducacionFormModal.vue";

const router = useRouter();

/* ======================
   STATE & FILTERS
====================== */
const items = ref([]);
const totalItems = ref(0);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

// Variables de búsqueda (conectadas al Toolbar)
const search = ref("");
const estudiaFilter = ref("");
const nivelFilter = ref("");
const institucionFilter = ref("");

const currentPage = ref(1);
const pageSize = ref(100); // Traemos más datos para filtrar en el front
const totalPages = ref(1);

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);

/* ======================
   LÓGICA DE FILTRADO (Frontend)
====================== */
const filteredItems = computed(() => {
  if (!items.value.length) return [];

  return items.value.filter((i) => {
    // 1. Filtro por Nombre o Cédula (Search)
    const term = search.value.trim().toLowerCase();
    const matchSearch = !term || 
      `${i.adolescenteNombre} ${i.adolescenteCedula}`.toLowerCase().includes(term);

    // 2. Filtro por Estudia (Sí/No)
    const matchEstudia = !estudiaFilter.value || i.estudia === estudiaFilter.value;

    // 3. Filtro por Nivel
    const nTerm = nivelFilter.value.trim().toLowerCase();
    const matchNivel = !nTerm || (i.nivel && i.nivel.toLowerCase().includes(nTerm));

    // 4. Filtro por Institución
    const iTerm = institucionFilter.value.trim().toLowerCase();
    const matchInst = !iTerm || (i.institucion && i.institucion.toLowerCase().includes(iTerm));

    // Debe cumplir todos los filtros activos
    return matchSearch && matchEstudia && matchNivel && matchInst;
  });
});

/* ======================
   HELPERS & MAPPING
====================== */
const normalize01 = (v, fallback = "0") => {
  const s = v === 1 || v === true || v === "1" ? "1" : v === 0 || v === false || v === "0" ? "0" : String(v ?? "");
  return s === "1" || s === "0" ? s : fallback;
};

const mapItem = (row) => {
  const nombres = row?.adolescente?.nombre ?? "";
  const apellidos = row?.adolescente?.apellido ?? "";
  
  return {
    id: row?.id,
    adolescenteId: row?.adolescente?.id || row?.adolescenteId,
    adolescenteNombre: `${nombres} ${apellidos}`.trim() || "Desconocido",
    adolescenteCedula: row?.adolescente?.cedula || "",
    fecha: row?.fecha ?? "",
    estudia: normalize01(row?.estudia, "0"),
    nivel: row?.nivel ?? "",
    institucion: row?.institucion ?? "",
    modalidad: row?.modalidad ?? "",
    carrera: row?.carrera ?? "",
    observacion: row?.observacion ?? "",
  };
};

/* ======================
   METHODS
====================== */
const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getEducaciones({
      page: currentPage.value,
      size: pageSize.value,
    });
    
    // Simplificamos la extracción de datos
    const data = res.data?.data || res.data || [];
    const list = Array.isArray(data) ? data : (data.data || []);
    
    items.value = list.map(mapItem);
    totalItems.value = res.data?.total || items.value.length;
    totalPages.value = res.data?.totalPages || 1;
  } catch (e) {
    console.error("Error cargando educación:", e);
    errorMessage.value = "Error al sincronizar datos.";
  } finally {
    isLoading.value = false;
  }
};

const openCreate = () => {
  modalMode.value = "create";
  modalInitial.value = null;
  modalOpen.value = true;
};

const openEdit = (row) => {
  modalMode.value = "edit";
  modalInitial.value = { ...row };
  editingId.value = row.id;
  modalOpen.value = true;
};

const closeModal = () => { modalOpen.value = false; };

const saveItem = async (payload) => {
  isSaving.value = true;
  try {
    if (modalMode.value === "create") {
      await createEducacion(payload);
    } else {
      await updateEducacion(editingId.value, payload);
    }
    await loadItems();
    closeModal();
  } catch (e) {
    alert("Error al guardar registro.");
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (row) => {
  if (!confirm(`¿Eliminar registro #${row.id}?`)) return;
  try {
    await deleteEducacion(row.id);
    items.value = items.value.filter((i) => i.id !== row.id);
  } catch (e) {
    alert("No se pudo eliminar.");
  }
};

const goToDetail = (row) => router.push(`/app/educacion/${row.id}`);

onMounted(loadItems);
</script>

<style scoped>
/* Tus estilos originales se mantienen exactamente igual */
.educacion-page { display: flex; flex-direction: column; gap: 24px; }
.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white; padding: 32px; border-radius: 24px; position: relative; overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15); display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: space-between;
}
.hero-stats { display: flex; gap: 12px; }
.stat-card {
  background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 20px; border-radius: 16px; min-width: 130px; display: flex; flex-direction: column;
}
.panel { background: white; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 20px; }
.spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>