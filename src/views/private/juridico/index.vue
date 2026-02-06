<template>
  <div class="page-container">

    <!-- Header -->
    <div class="header">
      <p class="eyebrow">Gestión</p>
      <h2 class="title">Jurídico</h2>
      <p class="subtitle">
        Gestión de causas, delitos y procesos jurídicos
      </p>
    </div>

    <!-- Content -->
    <div class="content-area">

      <JuridicoToolbar
        v-model:termino="termino"
        v-model:adolescenteId="adolescenteId"
        v-model:delitoId="delitoId"
        @create="openCreate"
      />

      <div class="table-wrapper">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando registros jurídicos...</p>
        </div>

        <JuridicoTable
          v-else
          :items="items"
          @view="goToDetail"
          @edit="openEdit"
          @delete="confirmDelete"
        />
      </div>

      <JuridicoPagination
        :page="page"
        :total-pages="totalPages"
        @change="changePage"
      />
    </div>

    <!-- Modal -->
    <JuridicoFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="selected"
      :saving="saving"
      @close="closeModal"
      @save="save"
    />
  </div>
</template>


<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";

import {
  getJuridicos,
  createJuridico,
  updateJuridico,
  deleteJuridico,
} from "@/service/juridico.service";

import JuridicoToolbar from "./components/JuridicoToolbar.vue";
import JuridicoTable from "./components/JuridicoTable.vue";
import JuridicoPagination from "./components/JuridicoPagination.vue";
import JuridicoFormModal from "./components/JuridicoFormModal.vue";

const router = useRouter();

/* estado */
const items = ref([]);
const page = ref(1);
const size = ref(10);
const totalPages = ref(1);

const termino = ref("");
const adolescenteId = ref(null);
const delitoId = ref(null);

const loading = ref(false);
const saving = ref(false);

/* modal */
const modalOpen = ref(false);
const modalMode = ref("create"); // create | edit
const selected = ref(null);

/* cargar data */
const loadData = async () => {
  loading.value = true;
  try {
    const res = await getJuridicos({
      page: page.value,
      size: size.value,
      termino: termino.value || undefined,
      adolescenteId: adolescenteId.value || undefined,
      delitoId: delitoId.value || undefined,
    });

    items.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

/* paginación */
const changePage = (p) => {
  page.value = p;
  loadData();
};

/* toolbar watch */
watch([termino, adolescenteId, delitoId], () => {
  page.value = 1;
  loadData();
});

/* modal */
const openCreate = () => {
  modalMode.value = "create";
  selected.value = null;
  modalOpen.value = true;
};

const openEdit = (row) => {
  modalMode.value = "edit";
  selected.value = row;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

/* guardar */
const save = async (payload) => {
  saving.value = true;
  try {
    if (modalMode.value === "create") {
      await createJuridico(payload);
    } else {
      await updateJuridico(selected.value.id, payload);
    }
    closeModal();
    loadData();
  } catch (e) {
    console.error(e);
  } finally {
    saving.value = false;
  }
};

/* eliminar */
const confirmDelete = async (row) => {
  if (!confirm(`¿Eliminar la causa ${row.numeroCausa}?`)) return;

  try {
    await deleteJuridico(row.id);
    loadData();
  } catch (e) {
    console.error(e);
  }
};

/* ver detalle */
const goToDetail = (row) => {
  router.push(`/juridico/${row.id}`);
};

onMounted(loadData);
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white;
  padding: 32px;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
}

.header::before,
.header::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.header::before {
  width: 280px;
  height: 280px;
  top: -80px;
  right: -60px;
}

.header::after {
  width: 180px;
  height: 180px;
  bottom: -60px;
  left: 40px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75rem;
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.title {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 800;
  position: relative;
  z-index: 1;
}

.subtitle {
  margin: 0;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  z-index: 1;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.table-wrapper {
  min-height: 200px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #64748b;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .header { padding: 24px; }
  .title { font-size: 1.5rem; }
}
</style>
