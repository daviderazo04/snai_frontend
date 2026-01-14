<template>
  <div class="gdos-page">
    
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catálogos</p>
        <h1>G2 (Grupos Organizados)</h1>
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
          <span class="label">Visibles</span>
          <strong>{{ filteredCount }}</strong>
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
        :total="filteredCount"
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
        :items="pagedGdos" 
        @edit="openEdit" 
        @remove="removeItem" 
      />

      <GdosPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="filteredCount"
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

// Helper para extraer datos de la respuesta
const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

// Mapeo seguro de datos
const mapGdo = (item) => {
  const rawId = item?.id ?? item?.gdoId;
  return {
    id: Number(rawId),
    nombre: item?.nombre ?? item?.name ?? "",
  };
};

export default {
  components: {
    GdosToolbar,
    GdosTable,
    GdosPagination,
    GdosFormModal,
  },
  setup() {
    const items = ref([]);
    const isLoading = ref(false);
    const isSaving = ref(false);
    const errorMessage = ref("");

    const search = ref("");
    const currentPage = ref(1);
    const pageSize = ref(10); // 10 items por página

    // Estado del Modal
    const modalOpen = ref(false);
    const modalMode = ref("create");
    const modalInitial = ref(null);
    const editingId = ref(null);

    // Filtros Frontend
    const filteredGdos = computed(() => {
      const term = search.value.trim().toLowerCase();
      if (!term) return items.value;
      return items.value.filter((item) =>
        (item.nombre || "").toLowerCase().includes(term)
      );
    });

    const filteredCount = computed(() => filteredGdos.value.length);
    const totalGdos = computed(() => items.value.length);
    const totalPages = computed(() =>
      Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
    );

    const pagedGdos = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredGdos.value.slice(start, start + pageSize.value);
    });

    watch(search, () => (currentPage.value = 1));

    // --- CARGAR DATOS ---
    const loadGdos = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getGdos();
        // Verificamos si el backend devuelve success false explícitamente
        if (res.data?.success === false) {
          throw new Error(res.data?.message || "Error al cargar");
        }
        const list = resolveList(res);
        items.value = list.map(mapGdo).filter((i) => i.nombre);
      } catch (err) {
        console.error("Error cargando G2:", err);
        errorMessage.value = "No se pudo cargar la lista de G2.";
        items.value = [];
      } finally {
        isLoading.value = false;
      }
    };

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
          if (res.data?.success === false) throw new Error(res.data?.message);
          
          const saved = res?.data?.data ?? res?.data;
          if (saved?.id) items.value.push(mapGdo(saved));
          else await loadGdos();

        } else {
          // EDITAR
          if (!editingId.value) return;
          const res = await updateGdo(editingId.value, { nombre });
          if (res.data?.success === false) throw new Error(res.data?.message);
          
          const saved = res?.data?.data ?? res?.data;
          if (saved?.id) {
            const idx = items.value.findIndex(i => i.id === editingId.value);
            if (idx !== -1) items.value[idx] = mapGdo(saved);
          } else {
            await loadGdos();
          }
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
        await deleteGdo(item.id);
        items.value = items.value.filter(i => i.id !== item.id);
      } catch (err) {
        console.error("Error eliminando G2:", err);
        alert("No se pudo eliminar el registro.");
      }
    };

    onMounted(loadGdos);

    return {
      search,
      currentPage,
      pageSize,
      totalPages,
      pagedGdos,
      filteredCount,
      totalGdos,
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