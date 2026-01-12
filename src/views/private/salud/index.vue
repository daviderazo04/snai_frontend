<!-- src/views/private/salud/index.vue -->
<template>
  <div class="salud-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Catálogos</p>
        <h1>Salud</h1>
        <p class="subtitle">
          Administra los registros de salud asociados a adolescentes.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ totalItems }}</strong>
          <span class="hint">Registros de salud</span>
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
      <SaludToolbar
        :search="search"
        :total="filteredCount"
        @update:search="search = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">Cargando registros...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <SaludTable
        :items="pagedItems"
        @edit="openEdit"
        @remove="removeItem"
      />

      <SaludPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:page="currentPage = $event"
      />
    </section>

    <SaludFormModal
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
  getSalud,
  createSalud,
  updateSalud,
  deleteSalud,
} from "@/service/salud.service.js";

import SaludToolbar from "./components/SaludToolbar.vue";
import SaludTable from "./components/SaludTable.vue";
import SaludPagination from "./components/SaludPagination.vue";
import SaludFormModal from "./components/SaludFormModal.vue";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.salud)) return payload.salud;
  return [];
};

const normalize01 = (v, fallback = "0") => {
  const s = v === 1 || v === true ? "1" : v === 0 || v === false ? "0" : String(v ?? "");
  return s === "1" || s === "0" ? s : fallback;
};

const mapItem = (row) => {
  const rawId = row?.id ?? row?.saludId ?? row?.idSalud;
  const idNum = Number(rawId);

  const adolescenteRaw = row?.adolescenteId ?? row?.adolescente_id ?? row?.idAdolescente;
  const adolescenteIdNum = Number(adolescenteRaw);

  const numAtenRaw = row?.numAtenMedica ?? row?.num_aten_medica ?? row?.numAtenciones;
  const numAtenNum = Number(numAtenRaw);

  return {
    id: Number.isNaN(idNum) ? rawId : idNum,
    adolescenteId: Number.isNaN(adolescenteIdNum) ? adolescenteRaw : adolescenteIdNum,
    fecha: row?.fecha ?? row?.date ?? "",
    diagnostico: row?.diagnostico ?? "",
    tomaMedicacion: normalize01(row?.tomaMedicacion, "0"),
    consumeSustancia: normalize01(row?.consumeSustancia, "0"),
    tipoSustancia: row?.tipoSustancia ?? "",
    numAtenMedica: Number.isNaN(numAtenNum) ? 0 : numAtenNum,
    discapacidad: normalize01(row?.discapacidad, "0"),
    observacion: row?.observacion ?? "",
  };
};

/* ======================
   STATE
====================== */
const items = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const search = ref("");
const currentPage = ref(1);
const pageSize = ref(6);

const modalOpen = ref(false);
const modalMode = ref("create"); // "create" | "edit"
const modalInitial = ref(null);
const editingId = ref(null);

/* ======================
   COMPUTED
====================== */
const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return items.value;

  return items.value.filter((i) => {
    const haystack = [
      i.id,
      i.adolescenteId,
      i.fecha,
      i.diagnostico,
      i.tipoSustancia,
      i.observacion,
      i.tomaMedicacion === "1" ? "si" : "no",
      i.consumeSustancia === "1" ? "si" : "no",
      i.discapacidad === "1" ? "si" : "no",
      i.numAtenMedica,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
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

/* ======================
   WATCHERS
====================== */
watch(search, () => {
  currentPage.value = 1;
});

watch(totalPages, (val) => {
  if (currentPage.value > val) currentPage.value = val;
});

/* ======================
   METHODS
====================== */
const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getSalud();
    const list = resolveList(res);
    items.value = list.map(mapItem);
  } catch (e) {
    console.error("Error cargando salud:", e);
    errorMessage.value = "No se pudo cargar registros de salud.";
    items.value = [];
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
  if (!payload) return;

  const adolescenteIdNum = Number(payload.adolescenteId);
  const numAtenNum = Number(payload.numAtenMedica);

  const clean = {
    adolescenteId: Number.isNaN(adolescenteIdNum) ? 0 : adolescenteIdNum,
    fecha: payload.fecha ? String(payload.fecha).trim() : "",
    diagnostico: payload.diagnostico ? String(payload.diagnostico).trim() : "",
    tomaMedicacion: payload.tomaMedicacion === "1" ? "1" : "0",
    consumeSustancia: payload.consumeSustancia === "1" ? "1" : "0",
    tipoSustancia: payload.tipoSustancia ? String(payload.tipoSustancia).trim() : "",
    numAtenMedica: Number.isNaN(numAtenNum) ? 0 : numAtenNum,
    discapacidad: payload.discapacidad === "1" ? "1" : "0",
    observacion: payload.observacion ? String(payload.observacion).trim() : "",
  };

  // mínimos obligatorios del DTO
  if (!clean.adolescenteId) return;
  if (!clean.fecha) return;

  isSaving.value = true;
  errorMessage.value = "";

  try {
    if (modalMode.value === "create") {
      const res = await createSalud(clean);
      const saved = res?.data?.data ?? res?.data;
      if (saved?.id != null) {
        items.value = [...items.value, mapItem(saved)];
      } else {
        await loadItems();
      }
    } else {
      if (editingId.value == null) return;

      const res = await updateSalud(editingId.value, clean);
      const saved = res?.data?.data ?? res?.data;

      if (saved?.id != null) {
        items.value = items.value.map((i) =>
          String(i.id) === String(editingId.value) ? mapItem(saved) : i
        );
      } else {
        items.value = items.value.map((i) =>
          String(i.id) === String(editingId.value) ? { ...i, ...clean } : i
        );
      }
    }

    closeModal();
  } catch (e) {
    console.error("Error guardando salud:", e);
    errorMessage.value = "Error guardando el registro de salud.";
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (row) => {
  const confirmed = window.confirm(
    `Eliminar el registro #${row.id}? Esta acción no se puede revertir.`
  );
  if (!confirmed) return;

  errorMessage.value = "";
  try {
    await deleteSalud(row.id);
    items.value = items.value.filter((i) => String(i.id) !== String(row.id));
  } catch (e) {
    console.error("Error eliminando salud:", e);
    errorMessage.value = "No se pudo eliminar el registro.";
  }
};

onMounted(loadItems);
</script>

<style scoped>
.salud-page {
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
  max-width: 640px;
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
