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
          <span class="label">En esta página</span>
          <strong>{{ visibleCount }}</strong>
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
    :total="totalItems"
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
        :items="items"
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
    (Array.isArray(inner?.traslados) ? inner.traslados : null) ??
    (Array.isArray(top.traslados) ? top.traslados : null) ??
    [];

  const rawTotalPages =
    top.totalPages ?? inner?.totalPages ?? inner?.last_page ?? inner?.lastPage ?? inner?.total_pages;
  const totalPages = Math.max(1, Number(rawTotalPages) || 1);

  const rawTotal =
    top.total ?? inner?.total ?? inner?.totalRecords ?? inner?.totalElements ?? inner?.total_items;
  const total = Number(rawTotal) || list.length;

  return { list, totalPages, total };
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
  const fromCaiObj = row?.fromCai ?? row?.desdeCai ?? null;
  const adolObj = row?.adolescente ?? row?.adolecente ?? null;

  const caiRaw = row?.caiId ?? row?.idCai ?? caiObj?.id;
  const fromCaiRaw = row?.fromCaiId ?? row?.idFromCai ?? fromCaiObj?.id;
  const adolRaw = row?.adolescenteId ?? row?.idAdolescente ?? adolObj?.id;

  const caiId = Number.isNaN(Number(caiRaw)) ? caiRaw : Number(caiRaw);
  const fromCaiId = Number.isNaN(Number(fromCaiRaw)) ? fromCaiRaw : Number(fromCaiRaw);
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
  const fromCaiCanton = fromCaiObj?.canton ?? null;
  const fromCaiProvincia = fromCaiCanton?.provincia ?? null;

  return {
    id: Number.isNaN(idNum) ? rawId : idNum,
    caiId,
    caiNombre: caiObj?.nombre ?? row?.caiNombre ?? "",
    caiCantonId: caiCanton?.id ?? row?.caiCantonId ?? row?.cantonId ?? "",
    caiCantonNombre: caiCanton?.nombre ?? row?.caiCantonNombre ?? "",
    caiProvinciaId: caiProvincia?.id ?? row?.caiProvinciaId ?? row?.provinciaId ?? "",
    caiProvinciaNombre: caiProvincia?.nombre ?? row?.caiProvinciaNombre ?? "",
    fromCaiId,
    fromCaiNombre: fromCaiObj?.nombre ?? row?.fromCaiNombre ?? "",
    fromCaiCantonId: fromCaiCanton?.id ?? row?.fromCaiCantonId ?? "",
    fromCaiCantonNombre: fromCaiCanton?.nombre ?? row?.fromCaiCantonNombre ?? "",
    fromCaiProvinciaId: fromCaiProvincia?.id ?? row?.fromCaiProvinciaId ?? "",
    fromCaiProvinciaNombre: fromCaiProvincia?.nombre ?? row?.fromCaiProvinciaNombre ?? "",
    adolescenteId,
    adolescenteNombre,
    adolescenteCedula,
    fecha: row?.fecha ?? row?.date ?? "",
    observaciones: row?.observaciones ?? row?.observacion ?? "",
  };
};

const items = ref([]);
const totalItems = ref(0);
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
const totalPages = ref(1);

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);

const baseCaiList = computed(() => {
  // Se arma a partir de los datos que devuelve el endpoint (cai y fromCai)
  const fromItems = items.value.flatMap((item) => {
    const arr = [];
    if (item.caiId) {
      arr.push({
        id: item.caiId,
        nombre: item.caiNombre || "CAI",
        cantonId: item.caiCantonId,
        cantonNombre: item.caiCantonNombre,
        provinciaId: item.caiProvinciaId,
        provinciaNombre: item.caiProvinciaNombre,
      });
    }
    if (item.fromCaiId) {
      arr.push({
        id: item.fromCaiId,
        nombre: item.fromCaiNombre || "CAI Origen",
        cantonId: item.fromCaiCantonId,
        cantonNombre: item.fromCaiCantonNombre,
        provinciaId: item.fromCaiProvinciaId,
        provinciaNombre: item.fromCaiProvinciaNombre,
      });
    }
    return arr;
  });

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

const visibleCount = computed(() => items.value.length);

const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const params = {
      search: search.value || undefined,
      from: dateFrom.value ? String(dateFrom.value).slice(0, 10) : undefined,
      to: dateTo.value ? String(dateTo.value).slice(0, 10) : undefined,
      sort: dateSort.value || undefined,
      provinciaId: selectedProvinceId.value || undefined,
      cantonId: selectedCantonId.value || undefined,
      caiId: selectedCaiId.value || undefined,
      page: currentPage.value,
      size: pageSize.value,
    };

    const res = await getTraslados(params);
    const payload = unwrap(res);
    const { list, totalPages: tp, total } = parsePaginated(payload);

    items.value = list.map(mapItem);
    totalPages.value = tp || 1;
    totalItems.value = total ?? items.value.length;

    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
    if (currentPage.value < 1) currentPage.value = 1;
  } catch (e) {
    console.error("Error cargando traslados:", e);
    errorMessage.value =
      e?.response?.data?.message || e?.message || "No se pudo cargar traslados.";
    items.value = [];
    totalItems.value = 0;
    totalPages.value = 1;
  } finally {
    isLoading.value = false;
  }
};

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
    loadItems();
  }
);

watch(totalPages, (val) => {
  if (currentPage.value > val) currentPage.value = val;
});

watch(currentPage, loadItems);

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

    await loadItems();

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
    const message = res?.data?.message || "Éxito";
    const isLastItemOnPage = items.value.length === 1 && currentPage.value > 1;
    if (isLastItemOnPage) {
      currentPage.value -= 1;
    } else {
      await loadItems();
    }
    alert(message);
  } catch (e) {
    console.error("Error eliminando traslado:", e);
    errorMessage.value = e?.response?.data?.message || e?.message || "No se pudo eliminar el traslado.";
    alert(errorMessage.value);
  }
};

onMounted(() => {
  loadItems();
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
