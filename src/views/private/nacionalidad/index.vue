<template>
  <div class="nacionalidad-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catálogos</p>
        <h1>Nacionalidades</h1>
        <p class="subtitle">
          Gestiona el catálogo de nacionalidades para los registros del sistema.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalNacionalidades }}</strong>
          <span class="hint">Nacionalidades registradas</span>
        </div>
        <div class="stat-card">
          <span class="label">En esta página</span>
          <strong>{{ visibleCount }}</strong>
          <span class="hint">Resultado del filtro actual</span>
        </div>
        <div class="stat-card">
          <span class="label">Página</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
          <span class="hint">Paginación activa</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <NacionalidadToolbar
        :search="search"
        :total="totalNacionalidades"
        @update:search="search = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">Cargando nacionalidades...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <NacionalidadTable 
        v-else
        :items="nacionalidades" 
        @edit="openEdit" 
        @remove="removeItem"
      />

      <NacionalidadPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="totalNacionalidades"
        @update:page="currentPage = $event"
      />
    </section>

    <NacionalidadFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="modalInitial"
      :saving="isSaving"
      @close="closeModal"
      @save="saveNacionalidad"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import {
  createNacionalidad,
  getNacionalidades,
  updateNacionalidad, // Importante: Importar función de editar
  deleteNacionalidad, // Importante: Importar función de eliminar
} from "../../../service/nacionalidad.service.js";

import NacionalidadToolbar from "./components/NacionalidadToolbar.vue";
import NacionalidadTable from "./components/NacionalidadTable.vue";
import NacionalidadPagination from "./components/NacionalidadPagination.vue";
import NacionalidadFormModal from "./components/NacionalidadFormModal.vue";

const mapNacionalidad = (item) => {
  const rawId = item?.id ?? item?.nacionalidadId ?? item?.idNacionalidad;
  return {
    id: Number(rawId),
    nombre: item?.nombre ?? item?.name ?? item?.nacionalidad ?? "",
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
    NacionalidadToolbar,
    NacionalidadTable,
    NacionalidadPagination,
    NacionalidadFormModal,
  },
  setup() {
    const nacionalidades = ref([]);
    const totalNacionalidades = ref(0);
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
    const editingId = ref(null); // Variable para almacenar el ID en edición

    const visibleCount = computed(() => nacionalidades.value.length);

    const loadNacionalidades = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getNacionalidades({
          nombre: search.value,
          page: currentPage.value,
          size: pageSize.value,
        });

        const payload = unwrap(res);
        const { list, totalPages: tp, total } = parsePaginated(payload);

        nacionalidades.value = list
          .map(mapNacionalidad)
          .filter((item) => item.nombre);
        totalPages.value = tp || 1;
        totalNacionalidades.value = total ?? nacionalidades.value.length;

        if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
        if (currentPage.value < 1) currentPage.value = 1;
      } catch (err) {
        console.error("Error cargando nacionalidades:", err);
        errorMessage.value =
          err?.response?.data?.message ||
          err?.message ||
          "Error de conexion con el servidor.";
        nacionalidades.value = [];
        totalPages.value = 1;
        totalNacionalidades.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    watch(currentPage, loadNacionalidades);
    watch(search, () => {
      currentPage.value = 1;
      loadNacionalidades();
    });
    watch(totalPages, (value) => {
      if (currentPage.value > value) currentPage.value = value;
    });

    const openCreate = () => {
      modalMode.value = "create";
      modalInitial.value = null;
      editingId.value = null;
      modalOpen.value = true;
    };

    const openEdit = (item) => {
      modalMode.value = "edit";
      modalInitial.value = { ...item };
      editingId.value = item.id; // Guardamos el ID que vamos a editar
      modalOpen.value = true;
    };

    const closeModal = () => {
      modalOpen.value = false;
      modalInitial.value = null;
      editingId.value = null;
    };

    const saveNacionalidad = async (payload) => {
      const nombre = payload?.nombre ? String(payload.nombre).trim() : "";
      if (!nombre) return;

      isSaving.value = true;
      errorMessage.value = "";
      
      try {
        if (modalMode.value === "create") {
          // Lógica de Creación
          const res = await createNacionalidad({ nombre });
          if (res.data?.success === false) {
            throw new Error(res.data?.message || "No se pudo guardar la nacionalidad.");
          }
        } else {
          // Lógica de Edición
          if (!editingId.value) return;
          const res = await updateNacionalidad(editingId.value, { nombre });
          if (res.data?.success === false) {
            throw new Error(res.data?.message || "No se pudo actualizar la nacionalidad.");
          }
        }
        
        await loadNacionalidades();
        closeModal();
      } catch (err) {
        console.error("Error guardando nacionalidad:", err);
        errorMessage.value = "Error de conexion con el servidor.";
      } finally {
        isSaving.value = false;
      }
    };

    const removeItem = async (item) => {
      if (!confirm(`¿Estás seguro de eliminar la nacionalidad "${item.nombre}"?`)) return;
      
      try {
        const res = await deleteNacionalidad(item.id);
        if (res?.data?.success === false) {
          throw new Error(res?.data?.message || "No se pudo eliminar la nacionalidad.");
        }
        const message = res?.data?.message || "Éxito";
        const isLastItemOnPage = nacionalidades.value.length === 1 && currentPage.value > 1;
        if (isLastItemOnPage) {
          currentPage.value -= 1;
        } else {
          await loadNacionalidades();
        }
        alert(message);
      } catch (err) {
        console.error("Error eliminando:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo eliminar el registro.";
        alert(msg);
      }
    };

    onMounted(loadNacionalidades);

    return {
      search,
      currentPage,
      pageSize,
      totalPages,
      totalNacionalidades,
      visibleCount,
      nacionalidades,
      modalOpen,
      modalMode,
      modalInitial,
      isLoading,
      isSaving,
      errorMessage,
      openCreate,
      openEdit,
      closeModal,
      saveNacionalidad,
      removeItem // Retornamos la función para usarla en el template
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

.nacionalidad-page {
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
