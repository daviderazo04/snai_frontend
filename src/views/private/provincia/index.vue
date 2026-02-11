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
      <ProvinciaToolbar
        :search="search"
        :total="totalProvincias"
        :can-edit="canEdit"
        @update:search="search = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">Cargando provincias...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <ProvinciaTable
        :items="provincias"
        :can-edit="canEdit"
        @view="goToDetail"
        @edit="openEdit"
        @remove="removeProvincia"
      />

      <ProvinciaPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="totalProvincias"
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
import {
  getProvincias,
  createProvincia,
  updateProvincia,
  deleteProvincia,
} from "../../../service/provincias.service.js";
import { puedeEditar } from "@/utils/permisos";
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
    (Array.isArray(inner?.provincias) ? inner.provincias : null) ??
    (Array.isArray(top.provincias) ? top.provincias : null) ??
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
    ProvinciaToolbar,
    ProvinciaTable,
    ProvinciaPagination,
    ProvinciaFormModal,
  },
  setup() {
    const router = useRouter();
    const provincias = ref([]);
    const totalProvincias = ref(0);
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
    const canEdit = computed(() => puedeEditar("/provincias"));

    const visibleCount = computed(() => provincias.value.length);

    const loadProvincias = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getProvincias({
          nombre: search.value,
          page: currentPage.value,
          size: pageSize.value,
        });

        const payload = unwrap(res);
        const { list, totalPages: tp, total } = parsePaginated(payload);

        provincias.value = list.map(mapProvincia).filter((item) => item.nombre);
        totalPages.value = tp || 1;
        totalProvincias.value = total ?? provincias.value.length;

        if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
        if (currentPage.value < 1) currentPage.value = 1;
      } catch (err) {
        console.error("Error cargando provincias:", err);
        errorMessage.value =
          err?.response?.data?.message ||
          err?.message ||
          "Error de conexion con el servidor.";
        provincias.value = [];
        totalPages.value = 1;
        totalProvincias.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    watch(search, () => {
      currentPage.value = 1;
      loadProvincias();
    });

    watch(totalPages, (value) => {
      if (currentPage.value > value) {
        currentPage.value = value;
      }
    });

    watch(currentPage, loadProvincias);

    const openCreate = () => {
      if (!canEdit.value) return;
      modalMode.value = "create";
      modalInitial.value = null;
      editingId.value = null;
      modalOpen.value = true;
    };

    const openEdit = (item) => {
      if (!canEdit.value) return;
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

    const saveProvincia = async (payload) => {
      if (!canEdit.value) return;
      const nombre = payload?.nombre ? String(payload.nombre).trim() : "";
      if (!nombre) return;
      if (modalMode.value === "edit" && editingId.value === null) return;

      isSaving.value = true;
      errorMessage.value = "";
      try {
        const res =
          modalMode.value === "create"
            ? await createProvincia({ nombre })
            : await updateProvincia(editingId.value, { nombre });
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo guardar la provincia.";
          return;
        }
        await loadProvincias();
        closeModal();
      } catch (err) {
        console.error("Error guardando provincia:", err);
        errorMessage.value = "Error de conexion con el servidor.";
      } finally {
        isSaving.value = false;
      }
    };

    const removeProvincia = async (item) => {
      if (!canEdit.value) return;
      const confirmed = window.confirm(
        `Eliminar la provincia ${item.nombre}? Esta accion no se puede revertir.`
      );
      if (!confirmed) return;
      errorMessage.value = "";
      try {
        const res = await deleteProvincia(item.id);
        if (res.data?.success === false) {
          throw new Error(res.data?.message || "No se pudo eliminar la provincia.");
        }
        const message = res?.data?.message || "Éxito";
        const isLastItemOnPage = provincias.value.length === 1 && currentPage.value > 1;
        if (isLastItemOnPage) {
          currentPage.value -= 1;
        } else {
          await loadProvincias();
        }
        alert(message);
      } catch (err) {
        console.error("Error eliminando provincia:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Error de conexion con el servidor.";
        errorMessage.value = msg;
        alert(msg);
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
      totalProvincias,
      visibleCount,
      provincias,
      modalOpen,
      modalMode,
      modalInitial,
      canEdit,
      isLoading,
      isSaving,
      errorMessage,
      openCreate,
      openEdit,
      closeModal,
      saveProvincia,
      removeProvincia,
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
