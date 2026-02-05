<template>
  <div class="cai-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catalogos</p>
        <h1>CAI</h1>
        <p class="subtitle">
          Gestiona los Centros de Adolescentes Infractores por canton y provincia.
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalCais }}</strong>
          <span class="hint">CAI registrados</span>
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
      <CaiToolbar
        :search="search"
        :province-id="selectedProvinceId"
        :canton-id="selectedCantonId"
        :provincias="provincias"
        :cantones="cantonOptions"
        :total="filteredCount"
        @update:search="search = $event"
        @update:province="selectedProvinceId = $event"
        @update:canton="selectedCantonId = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">Cargando CAI...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <CaiTable
        :items="pagedCais"
        @view="goToDetail"
        @edit="openEdit"
        @remove="removeCai"
      />

      <CaiPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total="filteredCount"
        @update:page="currentPage = $event"
      />
    </section>

    <CaiFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="modalInitial"
      :cantones="cantones"
      :saving="isSaving"
      @close="closeModal"
      @save="saveCai"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getProvincias } from "../../../service/provincias.service.js";
import { getCantones } from "../../../service/cantones.service.js";
import { createCai, getCais, updateCai, deleteCai } from "../../../service/cai.service.js";
import CaiToolbar from "./components/CaiToolbar.vue";
import CaiTable from "./components/CaiTable.vue";
import CaiPagination from "./components/CaiPagination.vue";
import CaiFormModal from "./components/CaiFormModal.vue";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.cais)) return payload.cais;
  if (Array.isArray(payload?.cantones)) return payload.cantones;
  if (Array.isArray(payload?.provincias)) return payload.provincias;
  return [];
};

const mapProvincia = (item) => {
  const rawId = item?.id ?? item?.provinciaId ?? item?.idProvincia;
  return {
    id: Number.isNaN(Number(rawId)) ? rawId : Number(rawId),
    nombre: item?.nombre ?? item?.name ?? item?.provincia ?? "",
  };
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

const mapCai = (item) => {
  const rawId = item?.id ?? item?.caiId ?? item?.idCai;
  const cantonId = item?.cantonId ?? item?.idCanton ?? item?.canton?.id;
  const provinciaId = item?.provinciaId ?? item?.idProvincia ?? item?.canton?.provincia?.id;
  return {
    id: Number.isNaN(Number(rawId)) ? rawId : Number(rawId),
    nombre: item?.nombre ?? item?.name ?? item?.cai ?? "",
    cantonId: Number.isNaN(Number(cantonId)) ? cantonId : Number(cantonId),
    cantonNombre: item?.canton?.nombre ?? item?.cantonNombre ?? "",
    provinciaId: Number.isNaN(Number(provinciaId)) ? provinciaId : Number(provinciaId),
    provinciaNombre: item?.canton?.provincia?.nombre ?? item?.provinciaNombre ?? "",
  };
};

export default {
  components: {
    CaiToolbar,
    CaiTable,
    CaiPagination,
    CaiFormModal,
  },
  setup() {
    const router = useRouter();
    const cais = ref([]);
    const cantones = ref([]);
    const provincias = ref([]);
    const isLoading = ref(false);
    const isSaving = ref(false);
    const errorMessage = ref("");

    const search = ref("");
    const selectedProvinceId = ref("");
    const selectedCantonId = ref("");
    const currentPage = ref(1);
    const pageSize = ref(6);

    const modalOpen = ref(false);
    const modalMode = ref("create");
    const modalInitial = ref(null);
    const editingId = ref(null);

    const cantonesById = computed(() => {
      const map = new Map();
      cantones.value.forEach((item) => {
        map.set(String(item.id), item);
      });
      return map;
    });

    const caisWithNames = computed(() => {
      const lookup = cantonesById.value;
      return cais.value.map((item) => {
        const ref = item.cantonId ? lookup.get(String(item.cantonId)) : null;
        return {
          ...item,
          cantonNombre: item.cantonNombre || ref?.nombre || "",
          provinciaId: item.provinciaId || ref?.provinciaId,
          provinciaNombre: item.provinciaNombre || ref?.provinciaNombre || "",
        };
      });
    });

    const cantonOptions = computed(() => {
      if (!selectedProvinceId.value) return cantones.value;
      return cantones.value.filter(
        (item) => String(item.provinciaId) === String(selectedProvinceId.value)
      );
    });

    const filteredCais = computed(() => {
      const term = search.value.trim().toLowerCase();
      return caisWithNames.value.filter((item) => {
        const matchesTerm = term
          ? (item.nombre || "").toLowerCase().includes(term)
          : true;
        const matchesProvince = selectedProvinceId.value
          ? String(item.provinciaId) === String(selectedProvinceId.value)
          : true;
        const matchesCanton = selectedCantonId.value
          ? String(item.cantonId) === String(selectedCantonId.value)
          : true;
        return matchesTerm && matchesProvince && matchesCanton;
      });
    });

    const filteredCount = computed(() => filteredCais.value.length);

    const totalPages = computed(() => {
      return Math.max(1, Math.ceil(filteredCais.value.length / pageSize.value));
    });

    const pagedCais = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredCais.value.slice(start, start + pageSize.value);
    });

    const totalCais = computed(() => cais.value.length);

    watch([search, selectedProvinceId, selectedCantonId], () => {
      currentPage.value = 1;
    });

    watch(totalPages, (value) => {
      if (currentPage.value > value) {
        currentPage.value = value;
      }
    });

    watch([selectedProvinceId, cantones], () => {
      if (!selectedCantonId.value) return;
      const exists = cantonOptions.value.some(
        (item) => String(item.id) === String(selectedCantonId.value)
      );
      if (!exists) {
        selectedCantonId.value = "";
      }
    });

    const loadCais = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getCais();
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo cargar CAI.";
          cais.value = [];
          return;
        }
        const list = resolveList(res);
        cais.value = list.map(mapCai).filter((item) => item.nombre);
      } catch (err) {
        console.error("Error cargando CAI:", err);
        errorMessage.value = "Error de conexion con el servidor.";
        cais.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const loadCantones = async () => {
      try {
        const res = await getCantones();
        if (res.data?.success === false) {
          cantones.value = [];
          return;
        }
        const list = resolveList(res);
        cantones.value = list.map(mapCanton).filter((item) => item.nombre);
      } catch (err) {
        console.error("Error cargando cantones:", err);
        cantones.value = [];
      }
    };

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

    const saveCai = async (payload) => {
      const nombre = payload?.nombre ? String(payload.nombre).trim() : "";
      const cantonId = Number(payload?.cantonId);
      if (!nombre || !cantonId) return;
      if (modalMode.value === "edit" && editingId.value === null) return;

      isSaving.value = true;
      errorMessage.value = "";
      try {
        const res =
          modalMode.value === "create"
            ? await createCai({ nombre, cantonId })
            : await updateCai(editingId.value, { nombre, cantonId });
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo guardar el CAI.";
          return;
        }
        const saved = res.data?.data;
        if (modalMode.value === "create") {
          if (saved?.id) {
            cais.value = [...cais.value, mapCai(saved)];
          } else {
            await loadCais();
          }
        } else if (editingId.value !== null) {
          if (saved?.id) {
            cais.value = cais.value.map((item) =>
              item.id === editingId.value ? mapCai(saved) : item
            );
          } else {
            cais.value = cais.value.map((item) =>
              item.id === editingId.value ? { ...item, nombre, cantonId } : item
            );
          }
        }
        closeModal();
      } catch (err) {
        console.error("Error guardando CAI:", err);
        errorMessage.value = "Error de conexion con el servidor.";
      } finally {
        isSaving.value = false;
      }
    };

    const removeCai = async (item) => {
      const confirmed = window.confirm(
        `Eliminar el CAI ${item.nombre}? Esta accion no se puede revertir.`
      );
      if (!confirmed) return;
      errorMessage.value = "";
      try {
        const res = await deleteCai(item.id);
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo eliminar el CAI.";
          return;
        }
        cais.value = cais.value.filter((cai) => cai.id !== item.id);
      } catch (err) {
        console.error("Error eliminando CAI:", err);
        errorMessage.value = "Error de conexion con el servidor.";
      }
    };

    // --- CORRECCIÓN APLICADA AQUÍ ---
    const goToDetail = (item) => {
      if (!item || !item.id) {
        console.error("Error: Intentando navegar a detalle sin ID", item);
        return;
      }
      // Se usa 'name' para coincidir con la ruta: { path: "cai/:id", name: "caiDetalle", ... }
      router.push({ 
        name: 'caiDetalle', 
        params: { id: item.id } 
      });
    };
    // --------------------------------

    onMounted(() => {
      loadCais();
      loadCantones();
      loadProvincias();
    });

    return {
      search,
      selectedProvinceId,
      selectedCantonId,
      currentPage,
      pageSize,
      totalPages,
      pagedCais,
      filteredCount,
      totalCais,
      modalOpen,
      modalMode,
      modalInitial,
      cantones,
      provincias,
      cantonOptions,
      isLoading,
      isSaving,
      errorMessage,
      openCreate,
      openEdit,
      closeModal,
      saveCai,
      removeCai,
      goToDetail,
    };
  },
};
</script>

<style scoped>
.cai-page {
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