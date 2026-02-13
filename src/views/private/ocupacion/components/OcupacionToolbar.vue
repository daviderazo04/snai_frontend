<template>
  <div class="toolbar">

    <div class="filters-container">
      
      <div class="row row-main">
        <div class="search-wrapper">
          <label class="label-text">Adolescente</label>
          <AdolescenteSearch
            v-model="adolInternal"
            :fetch-by-id="true"
            :label="''"
            placeholder="Buscar por nombre o cédula"
            @clear="clearFilters"
          />
        </div>
      </div>

      <div class="row row-secondary">
        <div class="filter-item">
          <label class="label-text">Buscar ocupación</label>
          <input
            type="text"
            placeholder="Nombre del taller o actividad"
            :value="search"
            @input="$emit('update:search', $event.target.value)"
          />
        </div>
      </div>
    </div>

    <div class="actions">
      <button
        v-if="search || adolInternal"
        class="btn-clear-action"
        @click="clearFilters"
        type="button"
      >
        🧹 Limpiar
      </button>

      <button v-if="canEdit" class="btn-primary" @click="$emit('create')" type="button">
        + Nueva ocupación
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed } from "vue";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";

const props = defineProps({
  search: {
    type: String,
    default: "",
  },
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

const emit = defineEmits(["update:search", "update:adolescenteId", "create"]);

const adolInternal = computed({
  get: () => props.adolescenteId,
  set: (v) => emit("update:adolescenteId", v),
});

const clearFilters = () => {
  emit("update:search", "");
  emit("update:adolescenteId", null);
};
</script>

<style scoped>
/* Estructura base alineada con el estándar del sistema */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  padding: 10px 0;
}

.filters-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.row-main {
  width: 100%;
}

.search-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Filtros secundarios */
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Estilo de inputs consistente */
.row-secondary input {
  width: 320px;
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Panel de acciones (Derecha) */
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-primary {
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  color: white;
  cursor: pointer;
  background: linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

/* Botón Limpiar (Estilo Estándar) */
.btn-clear-action {
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-clear-action:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
  }
  .actions {
    width: 100%;
    justify-content: flex-end;
  }
  .row-secondary input {
    width: 100%;
  }
}
</style>