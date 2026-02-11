<template>
  <div class="gdos-page">
    
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catálogos</p>
        <h1>GDO (Grupos Organizados)</h1>
        <p class="subtitle">
          Administración del catálogo de grupos G2 para el sistema penitenciario.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalGdos }}</strong>
          <span class="hint">Grupos registrados</span>
        </div>
        <div class="stat-card">
          <span class="label">En esta página</span>
          <strong>{{ visibleCount }}</strong>
          <span class="hint">Filtrados</span>
        </div>
        <div class="stat-card">
          <span class="label">Página</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
          <span class="hint">Paginación activa</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <GdosToolbar
        :search="search"
        :total="totalGdos"
        @update:search="search = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">
        <div class="spinner"></div>
        <span>Cargando G2...</span>
      </div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <GdosTable 
        v-else
        :items="gdos" 
        @edit="openEdit" 
        @remove="removeItem" 
      />

      <GdosPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="totalGdos"
        @update:page="currentPage = $event"
      />
    </section>

    <GdosFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="modalInitial"
      :saving="isSaving"
      @close="closeModal"
      @save="saveGdo"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
// Importamos el servicio completo con CRUD
import { 
  createGdo, 
  getGdos, 
  updateGdo, 
  deleteGdo 
} from "../../../service/gdos.service.js";

import GdosToolbar from "./components/GdosToolbar.vue";
import GdosTable from "./components/GdosTable.vue";
import GdosPagination from "./components/GdosPagination.vue";
import GdosFormModal from "./components/GdosFormModal.vue";

// Mapeo seguro de datos
const mapGdo = (item) => {
  const rawId = item?.id ?? item?.gdoId;
  return {
    id: Number(rawId),
    nombre: item?.nombre ?? item?.name ?? "",
  };
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
    [];

  const rawTotalPages =
    top.totalPages ?? inner?.totalPages ?? inner?.last_page ?? inner?.lastPage ?? inner?.total_pages;
  const totalPages = Math.max(1, Number(rawTotalPages) || 1);

  const rawTotal =
    top.total ?? inner?.total ?? inner?.totalRecords ?? inner?.totalElements ?? inner?.total_items;
  const total = Number(rawTotal) || list.length;

  return { list, totalPages, total };
};

export default {
  components: {
    GdosToolbar,
    GdosTable,
    GdosPagination,
    GdosFormModal,
  },
  setup() {
    const gdos = ref([]);
    const totalGdos = ref(0);
    const isLoading = ref(false);
    const isSaving = ref(false);
    const errorMessage = ref("");

    const search = ref("");
    const currentPage = ref(1);
    const pageSize = ref(10); // 10 items por página
    const totalPages = ref(1);

    // Estado del Modal
    const modalOpen = ref(false);
    const modalMode = ref("create");
    const modalInitial = ref(null);
    const editingId = ref(null);

    const visibleCount = computed(() => gdos.value.length);

    // --- CARGAR DATOS ---
    const loadGdos = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getGdos({
          nombre: search.value,
          page: currentPage.value,
          size: pageSize.value,
        });

        const payload = unwrap(res);
        const { list, totalPages: tp, total } = parsePaginated(payload);

        gdos.value = list.map(mapGdo).filter((i) => i.nombre);
        totalPages.value = tp || 1;
        totalGdos.value = total ?? gdos.value.length;

        if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
        if (currentPage.value < 1) currentPage.value = 1;
      } catch (err) {
        console.error("Error cargando G2:", err);
        errorMessage.value =
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo cargar la lista de G2.";
        gdos.value = [];
        totalPages.value = 1;
        totalGdos.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    watch(currentPage, loadGdos);
    watch(search, () => {
      currentPage.value = 1;
      loadGdos();
    });
    watch(totalPages, (value) => {
      if (currentPage.value > value) currentPage.value = value;
    });

    // --- ACCIONES MODAL ---
    const openCreate = () => {
      modalMode.value = "create";
      modalInitial.value = null;
      editingId.value = null;
      modalOpen.value = true;
    };

    const openEdit = (item) => {
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

    // --- GUARDAR (Crear / Editar) ---
    const saveGdo = async (payload) => {
      const nombre = payload?.nombre ? String(payload.nombre).trim() : "";
      if (!nombre) return;

      isSaving.value = true;
      errorMessage.value = "";

      try {
        if (modalMode.value === "create") {
          // CREAR
          const res = await createGdo({ nombre });
          if (res.data?.success === false) throw new Error(res.data?.message || "Error al cargar");
          
          await loadGdos();

        } else {
          // EDITAR
          if (!editingId.value) return;
          const res = await updateGdo(editingId.value, { nombre });
          if (res.data?.success === false) throw new Error(res.data?.message || "Error al cargar");
          
          await loadGdos();
        }
        closeModal();
      } catch (err) {
        console.error("Error guardando G2:", err);
        errorMessage.value = "Error al guardar el registro.";
      } finally {
        isSaving.value = false;
      }
    };

    // --- ELIMINAR ---
    const removeItem = async (item) => {
      if (!confirm(`¿Eliminar el GDO "${item.nombre}"?`)) return;

      try {
        const res = await deleteGdo(item.id);
        if (res?.data?.success === false) {
          throw new Error(res?.data?.message || "No se pudo eliminar el registro.");
        }
        const message = res?.data?.message || "Éxito";
        const isLastItemOnPage = gdos.value.length === 1 && currentPage.value > 1;
        if (isLastItemOnPage) {
          currentPage.value -= 1;
        } else {
          await loadGdos();
        }
        alert(message);
      } catch (err) {
        console.error("Error eliminando G2:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo eliminar el registro.";
        alert(msg);
      }
    };

    onMounted(loadGdos);

    return {
      search,
      currentPage,
      pageSize,
      totalPages,
      totalGdos,
      visibleCount,
      gdos,
      modalOpen,
      modalMode,
      modalInitial,
      isLoading,
      isSaving,
      errorMessage,
      openCreate,
      openEdit,
      closeModal,
      saveGdo,
      removeItem // Importante exportarlo para la tabla
    };
  },
};
</script>

<style scoped>
:global(:root) {
  --snai-navy: #0b1220;
  --snai-navy-2: #0f172a;
  --snai-blue: #1e3a8a;
  --snai-blue-2: #1d4ed8;
  --snai-yellow: #fbbf24;
  --snai-red: #ef4444;
  --snai-border: #e2e8f0;
  --snai-muted: #64748b;
}

.gdos-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hero Section */
.hero {
  background: linear-gradient(
    125deg,
    var(--snai-navy-2) 0%,
    var(--snai-blue) 45%,
    var(--snai-blue-2) 100%
  );
  color: white;
  padding: 28px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.22);
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  opacity: 0.9;
}

.hero::before {
  width: 240px; height: 240px; top: -70px; right: -60px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.35), transparent 65%);
}

.hero::after {
  width: 160px; height: 160px; bottom: -60px; left: 40px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.3), transparent 65%);
}

.hero-main {
  position: relative;
  z-index: 1;
  max-width: 560px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.7rem;
  margin-bottom: 8px;
  opacity: 0.8;
}

.hero-main h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  font-size: 0.98rem;
  opacity: 0.9;
}

/* Stats */
.hero-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 16px;
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-card strong {
  font-size: 1.5rem;
  color: #fff;
}

.label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
}

.hint {
  font-size: 0.78rem;
  opacity: 0.7;
}

/* Panel */
.panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: white;
  padding: 22px;
  border-radius: 18px;
  border: 1px solid var(--snai-border);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

/* Status & Spinner */
.status {
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #e5e7eb;
  color: var(--snai-muted);
}

.status.error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 720px) {
  .hero { padding: 22px; }
  .hero-main h1 { font-size: 1.6rem; }
}
</style>
