<template>
  <div class="parentesco-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catalogos</p>
        <h1>Parentescos</h1>
        <p class="subtitle">
          Gestiona el catalogo de parentescos para los registros del sistema.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalParentescos }}</strong>
          <span class="hint">Parentescos registrados</span>
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
      <ParentescoToolbar
        :search="search"
        :total="filteredCount"
        @update:search="search = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">Cargando parentescos...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <ParentescoTable :items="pagedParentescos" @edit="openEdit" />

      <ParentescoPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="filteredCount"
        @update:page="currentPage = $event"
      />
    </section>

    <ParentescoFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="modalInitial"
      :saving="isSaving"
      @close="closeModal"
      @save="saveParentesco"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import {
  createParentesco,
  getParentescos,
} from "../../../service/parentesco.service.js";
import ParentescoToolbar from "./components/ParentescoToolbar.vue";
import ParentescoTable from "./components/ParentescoTable.vue";
import ParentescoPagination from "./components/ParentescoPagination.vue";
import ParentescoFormModal from "./components/ParentescoFormModal.vue";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.parentescos)) return payload.parentescos;
  if (Array.isArray(payload?.parentesco)) return payload.parentesco;
  return [];
};

const mapParentesco = (item) => {
  const rawId = item?.id ?? item?.parentescoId ?? item?.idParentesco;
  return {
    id: Number.isNaN(Number(rawId)) ? rawId : Number(rawId),
    nombre: item?.nombre ?? item?.name ?? item?.parentesco ?? "",
  };
};

export default {
  components: {
    ParentescoToolbar,
    ParentescoTable,
    ParentescoPagination,
    ParentescoFormModal,
  },
  setup() {
    const parentescos = ref([]);
    const isLoading = ref(false);
    const isSaving = ref(false);
    const errorMessage = ref("");

    const search = ref("");
    const currentPage = ref(1);
    const pageSize = ref(6);

    const modalOpen = ref(false);
    const modalMode = ref("create");
    const modalInitial = ref(null);

    const filteredParentescos = computed(() => {
      const term = search.value.trim().toLowerCase();
      return parentescos.value.filter((item) =>
        term ? (item.nombre || "").toLowerCase().includes(term) : true
      );
    });

    const filteredCount = computed(() => filteredParentescos.value.length);

    const totalPages = computed(() =>
      Math.max(1, Math.ceil(filteredParentescos.value.length / pageSize.value))
    );

    const pagedParentescos = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredParentescos.value.slice(start, start + pageSize.value);
    });

    const totalParentescos = computed(() => parentescos.value.length);

    watch(search, () => (currentPage.value = 1));
    watch(totalPages, (value) => {
      if (currentPage.value > value) currentPage.value = value;
    });

    const loadParentescos = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getParentescos();
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo cargar parentescos.";
          parentescos.value = [];
          return;
        }
        const list = resolveList(res);
        parentescos.value = list
          .map(mapParentesco)
          .filter((item) => item.nombre);
      } catch (err) {
        console.error("Error cargando parentescos:", err);
        errorMessage.value = "Error de conexion con el servidor.";
        parentescos.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const openCreate = () => {
      modalMode.value = "create";
      modalInitial.value = null;
      modalOpen.value = true;
    };

    const openEdit = (item) => {
      modalMode.value = "edit";
      modalInitial.value = { ...item };
      modalOpen.value = true;
    };

    const closeModal = () => {
      modalOpen.value = false;
      modalInitial.value = null;
    };

    const saveParentesco = async (payload) => {
      const nombre = payload?.nombre ? String(payload.nombre).trim() : "";
      if (!nombre) return;

      isSaving.value = true;
      errorMessage.value = "";
      try {
        const res = await createParentesco({ nombre });
        if (res.data?.success === false) {
          errorMessage.value =
            res.data?.message || "No se pudo guardar el parentesco.";
          return;
        }
        await loadParentescos();
        closeModal();
      } catch (err) {
        console.error("Error guardando parentesco:", err);
        errorMessage.value = "Error de conexion con el servidor.";
      } finally {
        isSaving.value = false;
      }
    };

    onMounted(loadParentescos);

    return {
      search,
      currentPage,
      pageSize,
      totalPages,
      pagedParentescos,
      filteredCount,
      totalParentescos,
      modalOpen,
      modalMode,
      modalInitial,
      isLoading,
      isSaving,
      errorMessage,
      openCreate,
      openEdit,
      closeModal,
      saveParentesco,
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

.parentesco-page {
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
