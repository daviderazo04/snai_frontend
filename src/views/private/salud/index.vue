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
        <span class="label">Total</span>
        <strong>{{ totalItems }}</strong>
        <span class="hint">Registros de salud</span>
      </div>
      <div class="stat-card">
        <span class="label">En esta página</span>
        <strong>{{ items.length }}</strong>
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
      <SaludToolbar
        :search="search"
        :total="totalItems"
        @update:search="search = $event"
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
import { useRouter } from "vue-router"; // Importamos router
import {
  getSalud,
  createSalud,
  updateSalud,
  deleteSalud,
} from "@/service/salud.service.js";

import SaludToolbar from "./components/SaludToolbar.vue";
import SaludTable from "./components/SaludTable.vue";
import SaludPagination from "./components/SaludPagination.vue";
import SaludFormModal from "./components/SaludFormModal.vue";

const router = useRouter(); // Instancia del router

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

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
    (Array.isArray(top.rows) ? top.rows : null) ??
    (Array.isArray(inner?.rows) ? inner.rows : null) ??
    [];

  const rawTotalPages =
    top.totalPages ?? inner?.totalPages ?? inner?.last_page ?? inner?.lastPage ?? inner?.total_pages;
  const totalPages = Math.max(1, Number(rawTotalPages) || 1);

  const rawTotal =
    top.total ?? inner?.total ?? inner?.totalRecords ?? inner?.totalElements ?? inner?.total_items;
  const total = Number(rawTotal) || list.length;

  return { list, totalPages, total };
};

const normalize01 = (v, fallback = "0") => {
  const s = v === 1 || v === true ? "1" : v === 0 || v === false ? "0" : String(v ?? "");
  return s === "1" || s === "0" ? s : fallback;
};

// --- MAPEO ACTUALIZADO ---
const mapItem = (row) => {
  const rawId = row?.id ?? row?.saludId ?? row?.idSalud;
  
  // IDs de adolescente
  const adolescenteRaw = 
    row?.adolescente?.id ?? 
    row?.adolescenteId ?? 
    row?.adolescente_id ?? 
    row?.idAdolescente;

  // Extracción del Nombre
  const nombres = row?.adolescente?.nombres ?? row?.adolescente?.nombre ?? "";
  const apellidos = row?.adolescente?.apellidos ?? row?.adolescente?.apellido ?? "";
  const fullName = `${nombres} ${apellidos}`.trim();

  return {
    id: Number(rawId),
    adolescenteId: Number(adolescenteRaw) || 0,
    // Aquí definimos el nombre que usará la tabla
    adolescenteNombre: fullName || "Adolescente #" + (adolescenteRaw || "?"),
    fecha: row?.fecha ?? row?.date ?? "",
    diagnostico: row?.diagnostico ?? "",
    tomaMedicacion: normalize01(row?.tomaMedicacion, "0"),
    consumeSustancia: normalize01(row?.consumeSustancia, "0"),
    tipoSustancia: row?.tipoSustancia ?? "",
    numAtenMedica: Number(row?.numAtenMedica ?? 0),
    discapacidad: normalize01(row?.discapacidad, "0"),
    observacion: row?.observacion ?? "",
  };
};

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

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);

/* ======================
   COMPUTED
====================== */
const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return items.value;

  return items.value.filter((i) => {
    const haystack = [
      i.id,
      i.adolescenteNombre,
      i.fecha,
      i.diagnostico,
      i.tipoSustancia,
      i.observacion,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
});

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
watch(currentPage, () => loadItems());

/* ======================
   METHODS
====================== */
const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getSalud({
      termino: search.value || undefined,
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
    console.error("Error cargando salud:", e);
    errorMessage.value = "No se pudo cargar registros de salud.";
    items.value = [];
    totalItems.value = 0;
    totalPages.value = 1;
  } finally {
    isLoading.value = false;
  }
};

// --- NAVEGACIÓN AL DETALLE ---
const goToDetail = (item) => {
  // Asegúrate de tener en router.js: { path: 'salud/:id', name: 'saludDetalle', ... }
  router.push({ name: 'saludDetalle', params: { id: item.id } });
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
  if (!payload) return;

  const clean = {
    adolescenteId: Number(payload.adolescenteId),
    fecha: payload.fecha ? String(payload.fecha).trim() : "",
    diagnostico: payload.diagnostico?.trim() || "",
    tomaMedicacion: payload.tomaMedicacion,
    consumeSustancia: payload.consumeSustancia,
    tipoSustancia: payload.tipoSustancia?.trim() || "",
    numAtenMedica: Number(payload.numAtenMedica),
    discapacidad: payload.discapacidad,
    observacion: payload.observacion?.trim() || "",
  };

  if (!clean.adolescenteId || !clean.fecha) return;

  isSaving.value = true;
  errorMessage.value = "";

  try {
    if (modalMode.value === "create") {
      const res = await createSalud(clean);
      const saved = res?.data?.data ?? res?.data;
      if (saved?.id != null) {
        items.value.push(mapItem(saved));
      } else {
        await loadItems();
      }
    } else {
      if (editingId.value == null) return;
      const res = await updateSalud(editingId.value, clean);
      const saved = res?.data?.data ?? res?.data;
      
      if (saved?.id != null) {
        const updated = mapItem(saved);
        const idx = items.value.findIndex(i => i.id === editingId.value);
        if (idx !== -1) items.value[idx] = updated;
      } else {
        await loadItems();
      }
    }
    closeModal();
  } catch (e) {
    console.error("Error guardando:", e);
    errorMessage.value = "Error al guardar el registro.";
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (row) => {
  if (!confirm(`¿Eliminar registro #${row.id}?`)) return;
  try {
    await deleteSalud(row.id);
    items.value = items.value.filter((i) => i.id !== row.id);
  } catch (e) {
    console.error("Error eliminando:", e);
    alert("No se pudo eliminar el registro.");
  }
};

onMounted(loadItems);
</script>

<style scoped>
.salud-page { display: flex; flex-direction: column; gap: 24px; }

/* Hero Section */
.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white; padding: 28px; border-radius: 20px; position: relative; overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}
.hero::before, .hero::after {
  content: ""; position: absolute; border-radius: 999px; background: rgba(255, 255, 255, 0.08);
}
.hero::before { width: 220px; height: 220px; top: -60px; right: -40px; }
.hero::after { width: 140px; height: 140px; bottom: -50px; left: 40px; }

.hero-main { position: relative; z-index: 1; max-width: 640px; }
.eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem; margin-bottom: 8px; opacity: 0.7; }
.hero-main h1 { margin: 0 0 8px; font-size: 2rem; }
.subtitle { margin: 0; font-size: 0.98rem; opacity: 0.85; }

/* Stats */
.hero-stats { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 20px; }
.stat-card {
  background: rgba(255, 255, 255, 0.12); border-radius: 16px; padding: 14px 16px;
  backdrop-filter: blur(6px); display: flex; flex-direction: column; gap: 6px;
}
.stat-card strong { font-size: 1.4rem; }
.label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
.hint { font-size: 0.78rem; opacity: 0.7; }

/* Panel */
.panel {
  display: flex; flex-direction: column; gap: 18px; background: white; padding: 22px;
  border-radius: 18px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

/* Status & Spinner */
.status {
  padding: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;
}
.status.error { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
.spinner {
  width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 720px) {
  .hero { padding: 22px; }
  .hero-main h1 { font-size: 1.6rem; }
}
</style>
