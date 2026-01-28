<template>
  <div class="traslados-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Gestión</p>
        <h1>Traslados</h1>
        <p class="subtitle">
          Administra los traslados de adolescentes entre CAI.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalItems }}</strong>
          <span class="hint">Traslados registrados</span>
        </div>
        <div class="stat-card">
          <span class="label">Visibles</span>
          <strong>{{ filteredCount }}</strong>
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
  <TrasladosToolbar
    :search="search"
    :date-from="dateFrom"
    :date-to="dateTo"
    :date-sort="dateSort"
    :province-id="selectedProvinceId"
    :canton-id="selectedCantonId"
    :cai-id="selectedCaiId"
    :provincias="provinceOptions"
    :cantones="cantonOptions"
    :cais="caiOptions"
    :total="filteredCount"
    @update:search="search = $event"
    @update:dateFrom="dateFrom = $event"
    @update:dateTo="dateTo = $event"
    @update:dateSort="dateSort = $event"
    @update:province="selectedProvinceId = $event"
    @update:canton="selectedCantonId = $event"
    @update:cai="selectedCaiId = $event"
    @create="openCreate"
  />

      <div v-if="isLoading" class="status">
        <div class="spinner"></div>
        <span>Cargando traslados...</span>
      </div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <TrasladosTable
        v-else
        :items="pagedItems"
        @edit="openEdit"
        @remove="removeItem"
      />

      <TrasladosPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:page="currentPage = $event"
      />
    </section>

    <TrasladosFormModal
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
import {
  getTraslados,
  createTraslado,
  updateTraslado,
  deleteTraslado,
} from "../../../service/traslados.service.js";
import { getCais } from "../../../service/cai.service.js";

import TrasladosToolbar from "./components/TrasladosToolbar.vue";
import TrasladosTable from "./components/TrasladosTable.vue";
import TrasladosPagination from "./components/TrasladosPagination.vue";
import TrasladosFormModal from "./components/TrasladosFormModal.vue";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.traslados)) return payload.traslados;
  return [];
};

const resolveCaiList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.cais)) return payload.cais;
  return [];
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

const toDateStamp = (value) => {
  if (!value) return null;
  const datePart = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
  const stamp = new Date(`${datePart}T00:00:00`).getTime();
  return Number.isNaN(stamp) ? null : stamp;
};

const mapItem = (row) => {
  const rawId = row?.id ?? row?.trasladoId ?? row?.idTraslado;
  const idNum = Number(rawId);

  const caiObj = row?.cai ?? null;
  const adolObj = row?.adolescente ?? row?.adolecente ?? null;

  const caiRaw = row?.caiId ?? row?.idCai ?? caiObj?.id;
  const adolRaw = row?.adolescenteId ?? row?.idAdolescente ?? adolObj?.id;

  const caiId = Number.isNaN(Number(caiRaw)) ? caiRaw : Number(caiRaw);
  const adolescenteId = Number.isNaN(Number(adolRaw)) ? adolRaw : Number(adolRaw);

  const adolescenteNombre =
    row?.adolescenteNombre ??
    row?.adolecenteNombre ??
    (adolObj ? `${adolObj.nombre ?? ""} ${adolObj.apellido ?? ""}`.trim() : "");

  const adolescenteCedula =
    row?.adolescenteCedula ??
    row?.adolecenteCedula ??
    adolObj?.cedula ??
    "";

  const caiCanton = caiObj?.canton ?? null;
  const caiProvincia = caiCanton?.provincia ?? null;

  return {
    id: Number.isNaN(idNum) ? rawId : idNum,
    caiId,
    caiNombre: caiObj?.nombre ?? row?.caiNombre ?? "",
    caiCantonId: caiCanton?.id ?? row?.caiCantonId ?? row?.cantonId ?? "",
    caiCantonNombre: caiCanton?.nombre ?? row?.caiCantonNombre ?? "",
    caiProvinciaId: caiProvincia?.id ?? row?.caiProvinciaId ?? row?.provinciaId ?? "",
    caiProvinciaNombre: caiProvincia?.nombre ?? row?.caiProvinciaNombre ?? "",
    adolescenteId,
    adolescenteNombre,
    adolescenteCedula,
    fecha: row?.fecha ?? row?.date ?? "",
    observaciones: row?.observaciones ?? row?.observacion ?? "",
  };
};

const items = ref([]);
const cais = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const search = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const dateSort = ref("desc");
const selectedProvinceId = ref("");
const selectedCantonId = ref("");
const selectedCaiId = ref("");
const currentPage = ref(1);
const pageSize = ref(6);

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);

const baseCaiList = computed(() => {
  if (cais.value.length > 0) return cais.value;
  const fromItems = items.value
    .filter((item) => item.caiId)
    .map((item) => ({
      id: item.caiId,
      nombre: item.caiNombre || "CAI",
      cantonId: item.caiCantonId,
      cantonNombre: item.caiCantonNombre,
      provinciaId: item.caiProvinciaId,
      provinciaNombre: item.caiProvinciaNombre,
    }));
  const map = new Map();
  fromItems.forEach((cai) => {
    if (!map.has(String(cai.id))) {
      map.set(String(cai.id), cai);
    }
  });
  return Array.from(map.values());
});

const provinceOptions = computed(() => {
  const map = new Map();
  baseCaiList.value.forEach((item) => {
    if (!item.provinciaId) return;
    const key = String(item.provinciaId);
    if (!map.has(key)) {
      map.set(key, { id: item.provinciaId, nombre: item.provinciaNombre || "Provincia" });
    }
  });
  return Array.from(map.values());
});

const cantonOptions = computed(() => {
  const map = new Map();
  baseCaiList.value.forEach((item) => {
    if (!item.cantonId) return;
    if (selectedProvinceId.value && String(item.provinciaId) !== String(selectedProvinceId.value)) {
      return;
    }
    const key = String(item.cantonId);
    if (!map.has(key)) {
      map.set(key, {
        id: item.cantonId,
        nombre: item.cantonNombre || "Cantón",
        provinciaId: item.provinciaId,
      });
    }
  });
  return Array.from(map.values());
});

const caiOptions = computed(() => {
  const list = baseCaiList.value.filter((item) => {
    if (selectedProvinceId.value && String(item.provinciaId) !== String(selectedProvinceId.value)) {
      return false;
    }
    if (selectedCantonId.value && String(item.cantonId) !== String(selectedCantonId.value)) {
      return false;
    }
    return true;
  });
  return list;
});

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase();
  const fromStamp = toDateStamp(dateFrom.value);
  const toStampRaw = toDateStamp(dateTo.value);
  const toStamp = toStampRaw != null ? toStampRaw : null;
  const startStamp =
    fromStamp != null && toStamp != null ? Math.min(fromStamp, toStamp) : fromStamp;
  const endStamp =
    fromStamp != null && toStamp != null ? Math.max(fromStamp, toStamp) : toStamp;

  let result = items.value.filter((item) => {
    if (term) {
      const haystack = `${item.adolescenteNombre || ""} ${item.adolescenteCedula || ""}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    if (selectedProvinceId.value && String(item.caiProvinciaId) !== String(selectedProvinceId.value)) {
      return false;
    }
    if (selectedCantonId.value && String(item.caiCantonId) !== String(selectedCantonId.value)) {
      return false;
    }
    if (selectedCaiId.value && String(item.caiId) !== String(selectedCaiId.value)) {
      return false;
    }

    if (startStamp != null || endStamp != null) {
      const itemStamp = toDateStamp(item.fecha);
      if (itemStamp == null) return false;
      if (startStamp != null && itemStamp < startStamp) return false;
      if (endStamp != null && itemStamp > endStamp) return false;
    }

    return true;
  });

  if (dateSort.value === "asc" || dateSort.value === "desc") {
    result = [...result].sort((a, b) => {
      const aStamp = toDateStamp(a.fecha) ?? 0;
      const bStamp = toDateStamp(b.fecha) ?? 0;
      return dateSort.value === "asc" ? aStamp - bStamp : bStamp - aStamp;
    });
  }

  return result;
});

const filteredCount = computed(() => filteredItems.value.length);
const totalItems = computed(() => items.value.length);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredItems.value.slice(start, start + pageSize.value);
});

watch(
  [
    search,
    dateFrom,
    dateTo,
    dateSort,
    selectedProvinceId,
    selectedCantonId,
    selectedCaiId,
  ],
  () => {
    currentPage.value = 1;
  }
);

watch(totalPages, (val) => {
  if (currentPage.value > val) currentPage.value = val;
});

watch([selectedProvinceId, cantonOptions], () => {
  if (!selectedCantonId.value) return;
  const exists = cantonOptions.value.some(
    (item) => String(item.id) === String(selectedCantonId.value)
  );
  if (!exists) selectedCantonId.value = "";
});

watch([selectedProvinceId, selectedCantonId, caiOptions], () => {
  if (!selectedCaiId.value) return;
  const exists = caiOptions.value.some(
    (item) => String(item.id) === String(selectedCaiId.value)
  );
  if (!exists) selectedCaiId.value = "";
});

const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getTraslados();
    if (res?.data?.success === false) {
      errorMessage.value = res?.data?.message || "No se pudo cargar traslados.";
      items.value = [];
      return;
    }
    const list = resolveList(res);
    items.value = list.map(mapItem);
  } catch (e) {
    console.error("Error cargando traslados:", e);
    errorMessage.value = "No se pudo cargar traslados.";
    items.value = [];
  } finally {
    isLoading.value = false;
  }
};

const loadCais = async () => {
  try {
    const res = await getCais();
    if (res?.data?.success === false) {
      cais.value = [];
      return;
    }
    const list = resolveCaiList(res);
    cais.value = list.map(mapCai).filter((item) => item.nombre);
  } catch (e) {
    console.error("Error cargando CAI:", e);
    cais.value = [];
  }
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
  const caiId = Number(payload?.caiId);
  const fecha = payload?.fecha ? String(payload.fecha).slice(0, 10) : "";
  const observaciones = payload?.observaciones ?? "";

  if (!caiId || !fecha) return;
  if (modalMode.value === "create") {
    const adolescenteId = Number(payload?.adolescenteId);
    if (!adolescenteId) return;
  }

  isSaving.value = true;
  errorMessage.value = "";

  try {
    let res;
    if (modalMode.value === "create") {
      res = await createTraslado({
        caiId,
        adolescenteId: Number(payload?.adolescenteId),
        fecha,
        observaciones,
      });
    } else {
      if (editingId.value == null) return;
      res = await updateTraslado(editingId.value, { caiId, fecha, observaciones });
    }

    if (res?.data?.success === false) {
      errorMessage.value = res?.data?.message || "No se pudo guardar el traslado.";
      return;
    }

    const saved = res?.data?.data ?? res?.data;
    if (saved?.id != null) {
      const mapped = mapItem(saved);
      if (modalMode.value === "create") {
        items.value = [...items.value, mapped];
      } else {
        items.value = items.value.map((item) => {
          if (String(item.id) !== String(editingId.value)) return item;
          return {
            ...item,
            ...mapped,
            caiNombre: mapped.caiNombre || item.caiNombre,
            adolescenteNombre: mapped.adolescenteNombre || item.adolescenteNombre,
          };
        });
      }
    } else {
      await loadItems();
    }

    closeModal();
  } catch (e) {
    console.error("Error guardando traslado:", e);
    errorMessage.value = "No se pudo guardar el traslado.";
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (row) => {
  const nombre = row?.adolescenteNombre ? ` de ${row.adolescenteNombre}` : "";
  if (!confirm(`¿Eliminar el traslado${nombre}?`)) return;

  try {
    const res = await deleteTraslado(row.id);
    if (res?.data?.success === false) {
      errorMessage.value = res?.data?.message || "No se pudo eliminar el traslado.";
      return;
    }
    items.value = items.value.filter((i) => String(i.id) !== String(row.id));
  } catch (e) {
    console.error("Error eliminando traslado:", e);
    errorMessage.value = "No se pudo eliminar el traslado.";
  }
};

onMounted(() => {
  loadItems();
  loadCais();
});
</script>

<style scoped>
.traslados-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white;
  padding: 32px;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.hero::before { width: 300px; height: 300px; top: -100px; right: -50px; }
.hero::after { width: 180px; height: 180px; bottom: -40px; left: 40px; }

.hero-main {
  position: relative;
  z-index: 1;
  max-width: 520px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75rem;
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.hero-main h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 800;
}

.subtitle {
  margin: 0;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
}

.hero-stats {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 20px;
  border-radius: 16px;
  min-width: 130px;
  display: flex;
  flex-direction: column;
}

.stat-card .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.stat-card strong {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-card .hint {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 2px;
}

.panel {
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status {
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
}

.status.error {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 860px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}
</style>
