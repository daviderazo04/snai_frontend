<template>
  <div class="page-container">
    
    <div class="header">
      <p class="eyebrow">Gestión</p>
      <h2 class="title">Familia</h2>
      <p class="subtitle">Registro de interacciones familiares, visitas y eventos</p>
    </div>

    <div class="content-area">
      <FamiliaToolbar 
        v-model:search="search"
        :total="pagination.total"
        :can-edit="canEdit"
        @create="openCreateModal"
      />

      <div class="table-wrapper">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando registros...</p>
        </div>

        <FamiliaTable 
          v-else
          :items="items"
          :can-edit="canEdit"
          @edit="openEditModal"
          @remove="handleDelete"
        />
      </div>

      <FamiliaPagination 
        :current-page="pagination.page"
        :total-pages="pagination.totalPages"
        @update:page="changePage"
      />
    </div>

    <FamiliaFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-data="selectedItem"
      @close="closeModal"
      @success="handleSuccess"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { getFamilias, deleteFamilia } from "../../../service/familia.service";
import { puedeEditar } from "@/utils/permisos";

import FamiliaToolbar from "./components/FamiliaToolbar.vue";
import FamiliaTable from "./components/FamiliaTable.vue";
import FamiliaPagination from "./components/FamiliaPagination.vue";
import FamiliaFormModal from "./components/FamiliaFormModal.vue";

const items = ref([]);
const loading = ref(false);
const search = ref("");

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
  totalPages: 1
});

const modalOpen = ref(false);
const modalMode = ref("create");
const selectedItem = ref(null);
const canEdit = computed(() => puedeEditar("/familia"));

const loadItems = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      termino: search.value // El backend usa 'termino' para filtrar
    };

    const res = await getFamilias(params);
    const payload = res.data || res;
    
    if (payload.data && Array.isArray(payload.data)) {
      items.value = payload.data;
      if (payload.meta) {
        pagination.total = payload.meta.totalItems || 0;
        pagination.totalPages = payload.meta.totalPages || 1;
      }
    } else if (Array.isArray(payload)) {
      items.value = payload;
      pagination.total = payload.length;
    }
  } catch (error) {
    console.error("Error cargando familias:", error);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

let searchTimeout;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.page = 1;
    loadItems();
  }, 400);
});

const openCreateModal = () => {
  if (!canEdit.value) return;
  modalMode.value = "create";
  selectedItem.value = null;
  modalOpen.value = true;
};

const openEditModal = (item) => {
  if (!canEdit.value) return;
  modalMode.value = "edit";
  selectedItem.value = { ...item };
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  selectedItem.value = null;
};

const handleSuccess = () => {
  loadItems(); // Recargar tras guardar exitoso
};

const handleDelete = async (item) => {
  if (!canEdit.value) return;
  if (confirm(`¿Eliminar el registro de familia ID #${item.id}?`)) {
    try {
      await deleteFamilia(item.id);
      loadItems();
    } catch (e) {
      console.error(e);
      alert("Error al eliminar");
    }
  }
};

const changePage = (newPage) => {
  if (newPage > 0 && newPage <= pagination.totalPages) {
    pagination.page = newPage;
    loadItems();
  }
};

onMounted(() => {
  loadItems();
});
</script>

<style scoped>
.page-container {
  display: flex; flex-direction: column; gap: 24px; max-width: 1200px; margin: 0 auto; width: 100%;
}

.header {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white; padding: 32px; border-radius: 24px; position: relative; overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
}
.header::before, .header::after {
  content: ""; position: absolute; border-radius: 999px; background: rgba(255, 255, 255, 0.08);
}
.header::before { width: 280px; height: 280px; top: -80px; right: -60px; }
.header::after { width: 180px; height: 180px; bottom: -60px; left: 40px; }

.eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 0.75rem; margin: 0 0 10px; color: rgba(255, 255, 255, 0.8); font-weight: 600; position: relative; z-index: 1; }
.title { margin: 0 0 8px; font-size: 2rem; font-weight: 800; position: relative; z-index: 1; }
.subtitle { margin: 0; font-size: 1.05rem; color: rgba(255, 255, 255, 0.9); position: relative; z-index: 1; }

.content-area { display: flex; flex-direction: column; gap: 20px; }
.table-wrapper { min-height: 200px; }

.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px; color: #64748b; background: white; border-radius: 16px; border: 1px solid #e2e8f0;
}
.spinner {
  width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) { .header { padding: 24px; } .title { font-size: 1.5rem; } }
</style>
