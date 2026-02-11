<template>
  <div class="page-container">
    
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">Gestión</p>
        <h1 class="title">Adolescentes</h1>
        <p class="subtitle">
          Administración del padrón de adolescentes infractores y sus expedientes.
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Total</span>
          <strong>{{ total }}</strong>
          <span class="hint">Adolescentes registrados</span>
        </div>
        <div class="stat-card">
          <span class="label">Visibles</span>
          <strong>{{ items.length }}</strong>
          <span class="hint">En esta página</span>
        </div>
        <div class="stat-card">
          <span class="label">Página</span>
          <strong>{{ page }} / {{ totalPages }}</strong>
          <span class="hint">Paginación activa</span>
        </div>
      </div>
    </section>

    <div class="content-area">
      <AdolescenteToolbar
        v-model:nombre="filters.nombre"
        v-model:cedula="filters.cedula"
        :total="total"
        :can-edit="canEdit"
        @create="openCreate"
      />

      <div class="table-wrapper">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando adolescentes...</p>
        </div>

        <AdolescenteTable
          v-else
          :items="items"
          :can-edit="canEdit"
          @view="goToDetail"
          @edit="openEdit"
          @remove="onDelete"
        />
      </div>

      <AdolescentePagination
        v-model:page="page"
        :total-pages="totalPages"
        :page-size="size"
        :total="total"
      />
    </div>

    <AdolescenteFormModal
      :open="modal.open"
      :mode="modal.mode"
      :initial-data="modal.initialData"
      :saving="saving"
      @close="closeModal"
      @save="onSave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import AdolescenteToolbar from "./components/AdolescenteToolbar.vue";
import AdolescenteTable from "./components/AdolescenteTable.vue";
import AdolescentePagination from "./components/AdolescentePagination.vue";
import AdolescenteFormModal from "./components/AdolescenteFormModal.vue";
import { puedeEditar } from "@/utils/permisos";
import {
  getAdolescentes,
  createAdolescente,
  updateAdolescente,
  deleteAdolescente,
} from "../../../service/adolescente.service";

const router = useRouter();

// --- ESTADO ---
const items = ref([]);
const totalPages = ref(1);
const total = ref(0);
const page = ref(1);
const size = ref(10);
const loading = ref(false);
const saving = ref(false);

const filters = reactive({
  nombre: "",
  cedula: "",
});

const modal = reactive({
  open: false,
  mode: "create",
  initialData: null,
});

const canEdit = computed(() => puedeEditar("/adolescentes"));

// --- CORRECCIÓN DE REDIRECCIÓN ---
const goToDetail = (item) => {
  if (!item || !item.id) return;
  // Usamos la ruta nombrada que definiremos en el router (ver abajo paso 3)
  router.push({ 
    name: 'adolescenteDetalle', 
    params: { id: item.id } 
  });
};

// --- CARGA DE DATOS ---
const load = async () => {
  loading.value = true;
  try {
    const res = await getAdolescentes({
      nombre: filters.nombre,
      cedula: filters.cedula,
      page: page.value,
      size: size.value,
    });
    
    // Extracción segura soportando respuestas paginadas y planas
    const payload = res.data || {};
    const dataList = payload.data || payload.items || payload.rows || [];
    
    items.value = Array.isArray(dataList) ? dataList : [];
    
    // Extracción de meta
    const totalItems = payload.meta?.totalItems ?? payload.total ?? items.value.length;
    const totalPgs = payload.meta?.totalPages ?? payload.totalPages ?? 1;

    total.value = Number(totalItems);
    totalPages.value = Number(totalPgs);

  } catch (err) {
    console.error("Error cargando adolescentes:", err);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

// --- WATCHERS ---
let timeout;
watch(
  () => [filters.nombre, filters.cedula],
  () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      page.value = 1;
      load();
    }, 400);
  }
);

watch(() => [page.value, size.value], () => load());

onMounted(() => {
  load();
});

// --- MODAL & ACCIONES ---
const openCreate = () => {
  if (!canEdit.value) return;
  modal.mode = "create";
  modal.initialData = null;
  modal.open = true;
};

const mapItemToForm = (item) => ({
  id: item.id,
  caiId: item.cai?.id ?? item.caiId ?? null,
  nacionalidadId: item.nacionalidad?.id ?? item.nacionalidadId ?? null,
  estadoCivilId: item.estadoCivil?.id ?? item.estadoCivilId ?? null,
  gdosId: item.gdos?.id ?? item.gdosId ?? null,
  etniaId: item.etnia?.id ?? item.etniaId ?? null,
  cantonId: item.canton?.id ?? item.cantonId ?? null,
  nombre: item.nombre ?? "",
  apellido: item.apellido ?? "",
  fecha_nac: item.fecha_nac ? String(item.fecha_nac).slice(0, 10) : "",
  hijos: item.hijos ?? 0,
  fecha_ingr: item.fecha_ingr ? String(item.fecha_ingr).slice(0, 10) : "",
  cedula: item.cedula ?? "",
  hijoPpl: String(item.hijoPpl ?? "0"),
  reincide: String(item.reincide ?? "0"),
  observaciones: item.observaciones ?? "",
});

const openEdit = (item) => {
  if (!canEdit.value) return;
  modal.mode = "edit";
  modal.initialData = mapItemToForm(item);
  modal.open = true;
};

const closeModal = () => {
  modal.open = false;
  modal.initialData = null;
};

const onSave = async (payload) => {
  if (!canEdit.value) return;
  saving.value = true;
  try {
    let res;
    if (modal.mode === "edit" && modal.initialData?.id) {
      res = await updateAdolescente(modal.initialData.id, payload);
    } else {
      res = await createAdolescente(payload);
    }
    if (res) {
      closeModal();
      await load();
    }
  } catch (err) {
    console.error("Error guardando:", err);
    alert("Error al guardar. Verifique los datos.");
  } finally {
    saving.value = false;
  }
};

const onDelete = async (item) => {
  if (!canEdit.value) return;
  if (confirm(`¿Eliminar a ${item.nombre} ${item.apellido}?`)) {
    try {
      await deleteAdolescente(item.id);
      load();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  }
};
</script>

<style scoped>
.page-container {
  display: flex; flex-direction: column; gap: 24px; max-width: 1200px; margin: 0 auto; width: 100%;
}

.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  border-radius: 24px; padding: 32px; color: white; position: relative; overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15); display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: space-between;
}

.hero::before, .hero::after {
  content: ""; position: absolute; border-radius: 999px; background: rgba(255, 255, 255, 0.08); pointer-events: none;
}
.hero::before { width: 300px; height: 300px; top: -100px; right: -50px; }
.hero::after { width: 180px; height: 180px; bottom: -40px; left: 40px; }

.hero-content { position: relative; z-index: 1; max-width: 500px; }
.eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 0.75rem; margin: 0 0 10px; opacity: 0.8; font-weight: 600; }
.title { margin: 0 0 8px; font-size: 2rem; font-weight: 800; }
.subtitle { margin: 0; font-size: 1.05rem; opacity: 0.9; }

.hero-stats { display: flex; gap: 12px; position: relative; z-index: 1; }
.stat-card {
  background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 20px; border-radius: 16px; min-width: 130px; display: flex; flex-direction: column;
}
.stat-card .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 4px; }
.stat-card strong { font-size: 1.5rem; font-weight: 700; }
.stat-card .hint { font-size: 0.75rem; opacity: 0.7; margin-top: 2px; }

.content-area { display: flex; flex-direction: column; gap: 20px; }
.table-wrapper { min-height: 300px; }

.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; color: #64748b;
}
.spinner {
  width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 860px) {
  .hero { flex-direction: column; align-items: flex-start; }
  .hero-stats { width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
}
</style>
