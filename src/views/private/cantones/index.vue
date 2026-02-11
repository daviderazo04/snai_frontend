<template>
  <div class="cantones-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catalogos</p>
        <h1>Cantones</h1>
        <p class="subtitle">
          Gestiona el catalogo de cantones para las provincias registradas.
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalCantones }}</strong>
          <span class="hint">Cantones registrados</span>
        </div>
        <div class="stat-card">
          <span class="label">En esta página</span>
          <strong>{{ visibleCount }}</strong>
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
      <CantonToolbar
        :search="search"
        :province-id="selectedProvinceId"
        :provincias="provincias"
        :total="totalCantones"
        @update:search="search = $event"
        @update:province="selectedProvinceId = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">Cargando cantones...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <CantonTable
        :items="cantones"
        @view="goToDetail"
        @edit="openEdit"
        @remove="removeCanton"
      />

      <CantonPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="totalCantones"
        @update:page="currentPage = $event"
      />
    </section>

    <CantonFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="modalInitial"
      :provincias="provincias"
      :saving="isSaving"
      @close="closeModal"
      @save="saveCanton"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getCantones,
  createCanton,
  updateCanton,
  deleteCanton,
} from "../../../service/cantones.service.js";
import { getProvincias } from "../../../service/provincias.service.js";
import CantonToolbar from "./components/CantonToolbar.vue";
import CantonTable from "./components/CantonTable.vue";
import CantonPagination from "./components/CantonPagination.vue";
import CantonFormModal from "./components/CantonFormModal.vue";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.cantones)) return payload.cantones;
  return [];
};

const mapCanton = (item) => {
  const rawId = item?.id ?? item?.cantonId ?? item?.idCanton;
  const rawProvinciaId = item?.provinciaId ?? item?.idProvincia ?? item?.provincia?.id;
  return {
    id: Number.isNaN(Number(rawId)) ? rawId : Number(rawId),
    nombre: item?.nombre ?? item?.name ?? item?.canton ?? "",
    provinciaId: Number.isNaN(Number(rawProvinciaId)) ? rawProvinciaId : Number(rawProvinciaId),
    provinciaNombre: item?.provincia?.nombre ?? item?.provinciaNombre ?? "",
  };
};

const mapProvincia = (item) => {
  const rawId = item?.id ?? item?.provinciaId ?? item?.idProvincia;
  return {
    id: Number.isNaN(Number(rawId)) ? rawId : Number(rawId),
    nombre: item?.nombre ?? item?.name ?? item?.provincia ?? "",
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
    (Array.isArray(inner?.rows) ? inner.rows : null) ??
    (Array.isArray(top.items) ? top.items : null) ??
    (Array.isArray(top.rows) ? top.rows : null) ??
    (Array.isArray(inner?.cantones) ? inner.cantones : null) ??
    (Array.isArray(top.cantones) ? top.cantones : null) ??
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
    CantonToolbar,
    CantonTable,
    CantonPagination,
    CantonFormModal,
  },
  setup() {
    const router = useRouter();
    const cantones = ref([]);
    const totalCantones = ref(0);
    const provincias = ref([]);
    const isLoading = ref(false);
    const isSaving = ref(false);
    const errorMessage = ref("");

    const search = ref("");
    const selectedProvinceId = ref("");
    const currentPage = ref(1);
    const pageSize = ref(6);
    const totalPages = ref(1);

    const modalOpen = ref(false);
    const modalMode = ref("create");
    const modalInitial = ref(null);
    const editingId = ref(null);

    const visibleCount = computed(() => cantones.value.length);

    const loadCantones = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getCantones({
          nombre: search.value,
          provinciaId: selectedProvinceId.value || undefined,
          page: currentPage.value,
          size: pageSize.value,
        });

        const payload = unwrap(res);
        const { list, totalPages: tp, total } = parsePaginated(payload);

        cantones.value = list.map(mapCanton).filter((item) => item.nombre);
        totalPages.value = tp || 1;
        totalCantones.value = total ?? cantones.value.length;

        if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
        if (currentPage.value < 1) currentPage.value = 1;
      } catch (err) {
        console.error("Error cargando cantones:", err);
        errorMessage.value =
          err?.response?.data?.message ||
          err?.message ||
          "Error de conexion con el servidor.";
        cantones.value = [];
        totalPages.value = 1;
        totalCantones.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    watch([search, selectedProvinceId], () => {
      currentPage.value = 1;
      loadCantones();
    });

    watch(totalPages, (value) => {
      if (currentPage.value > value) {
        currentPage.value = value;
      }
    });

    watch(currentPage, loadCantones);

    const loadProvincias = async () => {
      try {
        const res = await getProvincias();
        if (res.data?.success === false) {
          provincias.value = [];
          return;
        }
        const list = resolveList(res);
        provincias.value = list.map(mapProvincia).filter((item) => item.nombre);
      } catch (err) {
        console.error("Error cargando provincias:", err);
        provincias.value = [];
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

    const saveCanton = async (payload) => {
      const nombre = payload?.nombre ? String(payload.nombre).trim() : "";
      const provinciaId = Number(payload?.provinciaId);
      if (!nombre || !provinciaId) return;
      if (modalMode.value === "edit" && editingId.value === null) return;

      isSaving.value = true;
      errorMessage.value = "";
      try {
        const res =
          modalMode.value === "create"
            ? await createCanton({ nombre, provinciaId })
            : await updateCanton(editingId.value, { nombre, provinciaId });
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo guardar el canton.";
          return;
        }
        await loadCantones();
        closeModal();
      } catch (err) {
        console.error("Error guardando canton:", err);
        errorMessage.value = "Error de conexion con el servidor.";
      } finally {
        isSaving.value = false;
      }
    };

    const removeCanton = async (item) => {
      const confirmed = window.confirm(
        `Eliminar el canton ${item.nombre}? Esta accion no se puede revertir.`
      );
      if (!confirmed) return;
      errorMessage.value = "";
      try {
        const res = await deleteCanton(item.id);
        if (res.data?.success === false) {
          throw new Error(res.data?.message || "No se pudo eliminar el canton.");
        }
        const message = res?.data?.message || "Éxito";
        const isLastItemOnPage = cantones.value.length === 1 && currentPage.value > 1;
        if (isLastItemOnPage) {
          currentPage.value -= 1;
        } else {
          await loadCantones();
        }
        alert(message);
      } catch (err) {
        console.error("Error eliminando canton:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Error de conexion con el servidor.";
        errorMessage.value = msg;
        alert(msg);
      }
    };

    const goToDetail = (item) => {
      router.push(`/app/cantones/${item.id}`);
    };

    onMounted(loadCantones);
    onMounted(loadProvincias);

    return {
      search,
      selectedProvinceId,
      currentPage,
      pageSize,
      totalPages,
      totalCantones,
      visibleCount,
      cantones,
      modalOpen,
      modalMode,
      modalInitial,
      provincias,
      isLoading,
      isSaving,
      errorMessage,
      openCreate,
      openEdit,
      closeModal,
      saveCanton,
      removeCanton,
      goToDetail,
    };
  },
};
</script>

<style scoped>
.cantones-page {
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
