<!-- src/views/private/educacion/index.vue -->
<template>
  <div class="educacion-page">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Gestión</p>
        <h1>Educación</h1>
        <p class="subtitle">
          Administra los registros educativos asociados a adolescentes.
        </p>
      </div>

      <div class="hero-stats">
      <div class="stat-card">
        <span class="label">Total</span>
        <strong>{{ totalItems }}</strong>
        <span class="hint">Registros educativos</span>
      </div>

      <div class="stat-card">
        <span class="label">En esta página</span>
        <strong>{{ items.length }}</strong>
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
      <EducacionToolbar
        :search="search"
        :estudia="estudiaFilter"
        :nivel="nivelFilter"
        :institucion="institucionFilter"
        :total="totalItems"
        @update:search="search = $event"
        @update:estudia="estudiaFilter = $event"
        @update:nivel="nivelFilter = $event"
        @update:institucion="institucionFilter = $event"
        @create="openCreate"
      />

      <div v-if="isLoading" class="status">
        <div class="spinner"></div>
        <span>Cargando registros...</span>
      </div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

      <EducacionTable
        v-else
        :items="items"
        @view="goToDetail"
        @edit="openEdit"
        @remove="removeItem"
      />

      <EducacionPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="totalItems"
        @update:page="currentPage = $event"
      />
    </section>

    <EducacionFormModal
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
import { useRouter } from "vue-router";
import {
  getEducaciones,
  createEducacion,
  updateEducacion,
  deleteEducacion,
} from "@/service/educacion.service.js";
import { getAdolescentes } from "@/service/adolescente.service.js";

import EducacionToolbar from "./components/EducacionToolbar.vue";
import EducacionTable from "./components/EducacionTable.vue";
import EducacionPagination from "./components/EducacionPagination.vue";
import EducacionFormModal from "./components/EducacionFormModal.vue";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.educaciones)) return payload.educaciones;
  if (Array.isArray(payload?.educa)) return payload.educa;
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
    (Array.isArray(top.items) ? top.items : null) ??
    (Array.isArray(top.rows) ? top.rows : null) ??
    (Array.isArray(inner?.rows) ? inner.rows : null) ??
    (Array.isArray(inner?.educaciones) ? inner.educaciones : null) ??
    (Array.isArray(top.educaciones) ? top.educaciones : null) ??
    (Array.isArray(inner?.educa) ? inner.educa : null) ??
    (Array.isArray(top.educa) ? top.educa : null) ??
    [];

  const rawTotalPages =
    top.totalPages ?? inner?.totalPages ?? inner?.last_page ?? inner?.lastPage ?? inner?.total_pages;
  const totalPages = Math.max(1, Number(rawTotalPages) || 1);

  const rawTotal =
    top.total ?? inner?.total ?? inner?.totalRecords ?? inner?.totalElements ?? inner?.total_items;
  const total = Number(rawTotal) || list.length;

  return { list, totalPages, total };
};

const normalize01 = (v, fallback = "0") => {
  const s =
    v === 1 || v === true
      ? "1"
      : v === 0 || v === false
      ? "0"
      : String(v ?? "");
  return s === "1" || s === "0" ? s : fallback;
};

const mapItem = (row, adolescentesById) => {
  const rawId = row?.id ?? row?.educaId ?? row?.educacionId ?? row?.idEduca ?? row?.idEducacion;
  const idNum = Number(rawId);

  const adolescenteRaw =
    row?.adolescenteId ?? row?.adolescente_id ?? row?.idAdolescente ?? row?.adolescente?.id;
  const adolescenteIdNum = Number(adolescenteRaw);
  const adolescenteKey = adolescenteIdNum ? String(adolescenteIdNum) : null;

  const adolObj = row?.adolescente ?? null;
  const nombres = adolObj?.nombre ?? adolObj?.nombres ?? "";
  const apellidos = adolObj?.apellido ?? adolObj?.apellidos ?? "";
  const fullName = `${nombres} ${apellidos}`.trim();

  const lookup = adolescenteKey ? adolescentesById?.get(adolescenteKey) : null;

  return {
    id: Number.isNaN(idNum) ? rawId : idNum,
    adolescenteId: Number.isNaN(adolescenteIdNum) ? adolescenteRaw : adolescenteIdNum,
    adolescenteNombre: fullName || lookup?.nombre || "",
    adolescenteCedula: adolObj?.cedula ?? lookup?.cedula ?? "",
    fecha: row?.fecha ?? row?.date ?? "",
    estudia: normalize01(row?.estudia, "0"),
    razonNoEstudia: row?.razonNoEstudia ?? row?.razon_no_estudia ?? "",
    nivel: row?.nivel ?? "",
    cicloAcademico: row?.cicloAcademico ?? row?.ciclo_academico ?? "",
    carrera: row?.carrera ?? "",
    institucion: row?.institucion ?? "",
    modalidad: row?.modalidad ?? "",
    contacto: row?.contacto ?? "",
    observacion: row?.observacion ?? "",
  };
};

const router = useRouter();
const items = ref([]);
const totalItems = ref(0);
const adolescentes = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const search = ref("");
const estudiaFilter = ref("");
const nivelFilter = ref("");
const institucionFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(6);

const modalOpen = ref(false);
const modalMode = ref("create");
const modalInitial = ref(null);
const editingId = ref(null);

const adolescentesById = computed(() => {
  const map = new Map();
  adolescentes.value.forEach((item) => {
    if (!item?.id) return;
    const nombres = item?.nombre ?? item?.nombres ?? "";
    const apellidos = item?.apellido ?? item?.apellidos ?? "";
    map.set(String(item.id), {
      nombre: `${nombres} ${apellidos}`.trim() || `Adolescente #${item.id}`,
      cedula: item?.cedula ?? "",
    });
  });
  return map;
});

const itemsWithMeta = computed(() =>
  items.value.map((item) => {
    if (!item.adolescenteId) return item;
    const lookup = adolescentesById.value.get(String(item.adolescenteId));
    if (!lookup) return item;
    return {
      ...item,
      adolescenteNombre: item.adolescenteNombre || lookup.nombre,
      adolescenteCedula: item.adolescenteCedula || lookup.cedula,
    };
  })
);

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase();
  const nivelTerm = nivelFilter.value.trim().toLowerCase();
  const institucionTerm = institucionFilter.value.trim().toLowerCase();
  const estudiaValue = estudiaFilter.value;

  return itemsWithMeta.value.filter((i) => {
    if (term) {
      const haystack = `${i.adolescenteNombre || ""} ${i.adolescenteCedula || ""}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    if (estudiaValue === "1" || estudiaValue === "0") {
      if (i.estudia !== estudiaValue) return false;
    }

    if (nivelTerm && !String(i.nivel || "").toLowerCase().includes(nivelTerm)) {
      return false;
    }

    if (institucionTerm && !String(i.institucion || "").toLowerCase().includes(institucionTerm)) {
      return false;
    }

    return true;
  });
});

const filteredCount = computed(() => filteredItems.value.length);
const totalPages = ref(1);

watch([search, estudiaFilter, nivelFilter, institucionFilter], () => {
  currentPage.value = 1;
});

watch(totalPages, (val) => {
  if (currentPage.value > val) currentPage.value = val;
});

const loadItems = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getEducaciones({
      termino: search.value || undefined,
      estudia: estudiaFilter.value || undefined,
      nivel: nivelFilter.value || undefined,
      institucion: institucionFilter.value || undefined,
      page: currentPage.value,
      size: pageSize.value,
    });
    if (res?.data?.success === false) {
      errorMessage.value = res?.data?.message || "No se pudo cargar registros educativos.";
      items.value = [];
      return;
    }
    const payload = unwrap(res);
    const { list, totalPages: tp, total } = parsePaginated(payload);
    items.value = list.map((row) => mapItem(row, adolescentesById.value));
    totalPages.value = tp || 1;
    totalItems.value = total ?? items.value.length;

    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
    if (currentPage.value < 1) currentPage.value = 1;
  } catch (e) {
    console.error("Error cargando educación:", e);
    errorMessage.value = "No se pudo cargar registros educativos.";
    items.value = [];
    totalPages.value = 1;
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const loadAdolescentes = async () => {
  // Ya viene en la respuesta de educación, no se carga aparte
  adolescentes.value = [];
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
  const clean = {
    adolescenteId: Number.isNaN(adolescenteIdNum) ? 0 : adolescenteIdNum,
    fecha: payload.fecha ? String(payload.fecha).trim() : "",
    estudia: payload.estudia === "1" ? "1" : "0",
    razonNoEstudia: payload.razonNoEstudia ? String(payload.razonNoEstudia).trim() : "",
    nivel: payload.nivel ? String(payload.nivel).trim() : "",
    cicloAcademico: payload.cicloAcademico ? String(payload.cicloAcademico).trim() : "",
    carrera: payload.carrera ? String(payload.carrera).trim() : "",
    institucion: payload.institucion ? String(payload.institucion).trim() : "",
    modalidad: payload.modalidad ? String(payload.modalidad).trim() : "",
    contacto: payload.contacto ? String(payload.contacto).trim() : "",
    observacion: payload.observacion ? String(payload.observacion).trim() : "",
  };

  if (!clean.adolescenteId) return;
  if (!clean.fecha) return;

  isSaving.value = true;
  errorMessage.value = "";

  try {
    let res;
    if (modalMode.value === "create") {
      res = await createEducacion(clean);
    } else {
      if (editingId.value == null) return;
      res = await updateEducacion(editingId.value, clean);
    }

    if (res?.data?.success === false) {
      errorMessage.value = res?.data?.message || "No se pudo guardar el registro educativo.";
      return;
    }

    const saved = res?.data?.data ?? res?.data;
    if (saved?.id != null) {
      const mapped = mapItem(saved, adolescentesById.value);
      if (modalMode.value === "create") {
        items.value = [...items.value, mapped];
      } else {
        items.value = items.value.map((i) =>
          String(i.id) === String(editingId.value) ? mapped : i
        );
      }
    } else {
      await loadItems();
    }

    closeModal();
  } catch (e) {
    console.error("Error guardando educación:", e);
    errorMessage.value = "Error guardando el registro educativo.";
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
    const res = await deleteEducacion(row.id);
    if (res?.data?.success === false) {
      errorMessage.value = res?.data?.message || "No se pudo eliminar el registro.";
      return;
    }
    items.value = items.value.filter((i) => String(i.id) !== String(row.id));
  } catch (e) {
    console.error("Error eliminando educación:", e);
    errorMessage.value = "No se pudo eliminar el registro.";
  }
};

const goToDetail = (row) => {
  router.push(`/app/educacion/${row.id}`);
};

onMounted(async () => {
  await loadItems();
});
</script>

<style scoped>
.educacion-page {
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
