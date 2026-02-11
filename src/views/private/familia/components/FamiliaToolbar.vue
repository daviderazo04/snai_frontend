<template>
  <div class="toolbar">
    <div class="search-block">
      <AdolescenteSearch
        v-model="internalAdolescenteId"
        :fetch-by-id="true"
        :label="''"
        placeholder="Buscar adolescente por nombre o cédula"
        @clear="clearFilters"
      />
    </div>

    <div class="actions">
      <button
        v-if="internalAdolescenteId"
        class="btn-clear"
        @click="clearFilters"
      >
        <span class="icon">🧹</span>
        Limpiar
      </button>

      <button v-if="canEdit" class="btn-primary" @click="$emit('create')">
        + Nueva Interacción
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";

const props = defineProps({
  adolescenteId: {
    type: [Number, String, null],
    default: null,
  },
  total: Number,
  canEdit: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:adolescenteId", "create"]);

const internalAdolescenteId = computed({
  get: () => props.adolescenteId,
  set: (val) => emit("update:adolescenteId", val),
});

const clearFilters = () => {
  emit("update:adolescenteId", null);
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.search-block {
  flex: 1 1 280px;
  min-width: 240px;
}

/* Botón principal */
.toolbar .btn-primary {
  border: none;
  color: white;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  background: linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%);
  box-shadow: 0 14px 28px rgba(29, 78, 216, 0.22);
  transition: transform 0.08s ease, box-shadow 0.15s ease;
}

.toolbar .btn-primary:hover {
  box-shadow: 0 18px 34px rgba(29, 78, 216, 0.24);
}

.toolbar .btn-primary:active {
  transform: translateY(1px);
}

/* Botón limpiar */
.btn-clear {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.btn-clear:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
