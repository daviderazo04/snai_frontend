<template>
  <div class="etnia-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catalogos</p>
        <h1>Etnias</h1>
        <p class="subtitle">
          Gestiona el catalogo de etnias para los registros del sistema.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalEtnias }}</strong>
          <span class="hint">Etnias registradas</span>
        </div>
        <div class="stat-card">
          <span class="label">Visibles</span>
          <strong>{{ filteredCount }}</strong>
          <span class="hint">Resultado del filtro actual</span>
        </div>
        <div class="stat-card">
          <span class="label">Pagina</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
          <span class="hint">Paginacion activa</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <EtniaToolbar
        :search="search"
        :total="filteredCount"
        @update:search="search = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">Cargando etnias...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <EtniaTable :items="pagedEtnias" @edit="openEdit" @remove="removeEtnia" />

      <EtniaPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="filteredCount"
        @update:page="currentPage = $event"
      />
    </section>

    <EtniaFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="modalInitial"
      :saving="isSaving"
      @close="closeModal"
      @save="saveEtnia"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import {
  createEtnia,
  getEtnias,
  updateEtnia,
  deleteEtnia,
} from "../../../service/etnia.service.js";
import EtniaToolbar from "./components/EtniaToolbar.vue";
import EtniaTable from "./components/EtniaTable.vue";
import EtniaPagination from "./components/EtniaPagination.vue";
import EtniaFormModal from "./components/EtniaFormModal.vue";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.etnias)) return payload.etnias;
  if (Array.isArray(payload?.etnia)) return payload.etnia;
  return [];
};

const mapEtnia = (item) => {
  const rawId = item?.id ?? item?.etniaId ?? item?.idEtnia;
  return {
    id: Number.isNaN(Number(rawId)) ? rawId : Number(rawId),
    nombre: item?.nombre ?? item?.name ?? item?.etnia ?? "",
  };
};

export default {
  components: {
    EtniaToolbar,
    EtniaTable,
    EtniaPagination,
    EtniaFormModal,
  },
  setup() {
    const etnias = ref([]);
    const isLoading = ref(false);
    const isSaving = ref(false);
    const errorMessage = ref("");

    const search = ref("");
    const currentPage = ref(1);
    const pageSize = ref(6);

    const modalOpen = ref(false);
    const modalMode = ref("create");
    const modalInitial = ref(null);
    const editingId = ref(null);

    const filteredEtnias = computed(() => {
      const term = search.value.trim().toLowerCase();
      return etnias.value.filter((item) =>
        term ? (item.nombre || "").toLowerCase().includes(term) : true
      );
    });

    const filteredCount = computed(() => filteredEtnias.value.length);

    const totalPages = computed(() =>
      Math.max(1, Math.ceil(filteredEtnias.value.length / pageSize.value))
    );

    const pagedEtnias = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredEtnias.value.slice(start, start + pageSize.value);
    });

    const totalEtnias = computed(() => etnias.value.length);

    watch(search, () => (currentPage.value = 1));
    watch(totalPages, (value) => {
      if (currentPage.value > value) currentPage.value = value;
    });

    const loadEtnias = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getEtnias();
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo cargar etnias.";
          etnias.value = [];
          return;
        }
        const list = resolveList(res);
        etnias.value = list.map(mapEtnia).filter((item) => item.nombre);
      } catch (err) {
        console.error("Error cargando etnias:", err);
        errorMessage.value = "Error de conexion con el servidor.";
        etnias.value = [];
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

    const saveEtnia = async (payload) => {
      const nombre = payload?.nombre ? String(payload.nombre).trim() : "";
      if (!nombre) return;
      if (modalMode.value === "edit" && editingId.value === null) return;

      isSaving.value = true;
      errorMessage.value = "";
      try {
        const res =
          modalMode.value === "create"
            ? await createEtnia({ nombre })
            : await updateEtnia(editingId.value, { nombre });

        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo guardar la etnia.";
          return;
        }

        const saved = res.data?.data;
        if (modalMode.value === "create") {
          if (saved?.id) etnias.value = [...etnias.value, mapEtnia(saved)];
          else await loadEtnias();
        } else if (editingId.value !== null) {
          if (saved?.id) {
            etnias.value = etnias.value.map((item) =>
              item.id === editingId.value ? mapEtnia(saved) : item
            );
          } else {
            etnias.value = etnias.value.map((item) =>
              item.id === editingId.value ? { ...item, nombre } : item
            );
          }
        }

        closeModal();
      } catch (err) {
        console.error("Error guardando etnia:", err);
        errorMessage.value = "Error de conexion con el servidor.";
      } finally {
        isSaving.value = false;
      }
    };

    const removeEtnia = async (item) => {
      const confirmed = window.confirm(
        `Eliminar la etnia ${item.nombre}? Esta accion no se puede revertir.`
      );
      if (!confirmed) return;

      errorMessage.value = "";
      try {
        const res = await deleteEtnia(item.id);
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo eliminar la etnia.";
          return;
        }
        etnias.value = etnias.value.filter((etnia) => etnia.id !== item.id);
      } catch (err) {
        console.error("Error eliminando etnia:", err);
        errorMessage.value = "Error de conexion con el servidor.";
      }
    };

    onMounted(loadEtnias);

    return {
      search,
      currentPage,
      pageSize,
      totalPages,
      pagedEtnias,
      filteredCount,
      totalEtnias,
      modalOpen,
      modalMode,
      modalInitial,
      isLoading,
      isSaving,
      errorMessage,
      openCreate,
      openEdit,
      closeModal,
      saveEtnia,
      removeEtnia,
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
  --snai-sky: #38bdf8;
  --snai-yellow: #fbbf24;
  --snai-red: #ef4444;
  --snai-border: #e2e8f0;
  --snai-muted: #64748b;
}

.etnia-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

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
  filter: blur(0px);
  opacity: 0.9;
}

.hero::before {
  width: 240px;
  height: 240px;
  top: -70px;
  right: -60px;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(251, 191, 36, 0.35),
    rgba(251, 191, 36, 0) 65%
  );
}

.hero::after {
  width: 160px;
  height: 160px;
  bottom: -60px;
  left: 40px;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(56, 189, 248, 0.3),
    rgba(56, 189, 248, 0) 65%
  );
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
  color: rgba(255, 255, 255, 0.72);
}

.hero-main h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  font-size: 0.98rem;
  color: rgba(255, 255, 255, 0.86);
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

.stat-card strong::after {
  content: "";
  display: block;
  width: 28px;
  height: 3px;
  margin-top: 6px;
  border-radius: 999px;
  background: var(--snai-yellow);
  opacity: 0.9;
}

.label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.75);
}

.hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.72);
}

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

.status {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  color: var(--snai-muted);
  font-size: 0.92rem;
}

.status.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.22);
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
