<template>
  <div class="provincias-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catalogos</p>
        <h1>Provincias</h1>
        <p class="subtitle">
          Controla la informacion territorial y prepara el catalogo para la
          integracion con los servicios.
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalProvincias }}</strong>
          <span class="hint">Provincias registradas</span>
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
      <ProvinciaToolbar
        :search="search"
        :total="filteredCount"
        @update:search="search = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">Cargando provincias...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <ProvinciaTable
        :items="pagedProvincias"
        @view="goToDetail"
      />

      <ProvinciaPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="filteredCount"
        @update:page="currentPage = $event"
      />
    </section>

    <ProvinciaFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="modalInitial"
      :saving="isSaving"
      @close="closeModal"
      @save="saveProvincia"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getProvincias, createProvincia } from "../../../service/provincias.service.js";
import ProvinciaToolbar from "./components/ProvinciaToolbar.vue";
import ProvinciaTable from "./components/ProvinciaTable.vue";
import ProvinciaPagination from "./components/ProvinciaPagination.vue";
import ProvinciaFormModal from "./components/ProvinciaFormModal.vue";

const mapProvincia = (item) => {
  const rawId = item?.id ?? item?.provinciaId ?? item?.idProvincia;
  const numericId = Number(rawId);
  return {
    id: Number.isNaN(numericId) ? rawId : numericId,
    nombre: item?.nombre ?? item?.name ?? item?.provincia ?? "",
  };
};

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.provincias)) return payload.provincias;
  return [];
};

export default {
  components: {
    ProvinciaToolbar,
    ProvinciaTable,
    ProvinciaPagination,
    ProvinciaFormModal,
  },
  setup() {
    const router = useRouter();
    const provincias = ref([]);
    const isLoading = ref(false);
    const isSaving = ref(false);
    const errorMessage = ref("");

    const search = ref("");
    const currentPage = ref(1);
    const pageSize = ref(6);

    const modalOpen = ref(false);
    const modalMode = ref("create");
    const modalInitial = ref(null);

    const filteredProvincias = computed(() => {
      const term = search.value.trim().toLowerCase();
      return provincias.value.filter((item) => {
        if (!term) return true;
        const haystack = `${item.nombre} ${item.id}`.toLowerCase();
        return haystack.includes(term);
      });
    });

    const filteredCount = computed(() => filteredProvincias.value.length);

    const totalPages = computed(() => {
      return Math.max(1, Math.ceil(filteredProvincias.value.length / pageSize.value));
    });

    const pagedProvincias = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredProvincias.value.slice(start, start + pageSize.value);
    });

    const totalProvincias = computed(() => provincias.value.length);

    watch(search, () => {
      currentPage.value = 1;
    });

    watch(totalPages, (value) => {
      if (currentPage.value > value) {
        currentPage.value = value;
      }
    });

    const loadProvincias = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getProvincias();
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo cargar provincias.";
          provincias.value = [];
          return;
        }
        const list = resolveList(res);
        provincias.value = list.map(mapProvincia).filter((item) => item.nombre);
      } catch (err) {
        console.error("Error cargando provincias:", err);
        errorMessage.value = "Error de conexion con el servidor.";
        provincias.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const openCreate = () => {
      modalMode.value = "create";
      modalInitial.value = null;
      modalOpen.value = true;
    };

    const closeModal = () => {
      modalOpen.value = false;
      modalInitial.value = null;
    };

    const saveProvincia = async (payload) => {
      const nombre = payload?.nombre ? String(payload.nombre).trim() : "";
      if (!nombre) return;

      isSaving.value = true;
      errorMessage.value = "";
      try {
        const res = await createProvincia({ nombre });
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo guardar la provincia.";
          return;
        }
        const created = res.data?.data;
        if (created?.id) {
          provincias.value = [...provincias.value, mapProvincia(created)];
        } else {
          await loadProvincias();
        }
        closeModal();
      } catch (err) {
        console.error("Error guardando provincia:", err);
        errorMessage.value = "Error de conexion con el servidor.";
      } finally {
        isSaving.value = false;
      }
    };

    const goToDetail = (item) => {
      router.push(`/app/provincias/${item.id}`);
    };

    onMounted(loadProvincias);

    return {
      search,
      currentPage,
      pageSize,
      totalPages,
      pagedProvincias,
      filteredCount,
      totalProvincias,
      modalOpen,
      modalMode,
      modalInitial,
      isLoading,
      isSaving,
      errorMessage,
      openCreate,
      closeModal,
      saveProvincia,
      goToDetail,
    };
  },
};
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
