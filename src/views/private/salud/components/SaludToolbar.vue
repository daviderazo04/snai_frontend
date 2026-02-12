<template>
  <div class="toolbar">
    <div class="filters">
      <label class="field">
        <span class="label-text">Adolescente</span>
        <AdolescenteSearch
          v-model="adolInternal"
          :fetch-by-id="true"
          :label="''"
          placeholder="Buscar por nombre o cédula"
          @clear="clearFilters"
        />
      </label>

      <label class="field">
        <span class="label-text">Diagnóstico</span>
        <input
          type="text"
          placeholder="Ej: Gripe..."
          :value="diagnostico"
          @input="$emit('update:diagnostico', $event.target.value)"
        />
      </label>

      <label class="field">
        <span class="label-text">¿Discapacidad?</span>
        <select
          :value="discapacidad"
          @change="$emit('update:discapacidad', $event.target.value)"
        >
          <option value="">Todos</option>
          <option value="1">Sí</option>
          <option value="0">No</option>
        </select>
      </label>

      <!-- Acciones de filtros -->
      <div class="filter-actions">
        <button
          v-if="hasFilters"
          class="btn-clear"
          @click="clearFilters"
          type="button"
        >
          <span class="icon">🧹</span>
          Limpiar
        </button>
      </div>
    </div>

    <button v-if="canEdit" class="btn-primary" @click="$emit('create')" type="button">
      + Nuevo registro
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";

const props = defineProps({
  searchNombre: {
    type: [String, Number, null],
    default: "",
  },
  diagnostico: {
    type: String,
    default: "",
  },
  discapacidad: {
    type: String,
    default: "",
  },
  canEdit: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:searchNombre",
  "update:diagnostico",
  "update:discapacidad",
  "create",
]);

const adolInternal = computed({
  get: () => props.searchNombre,
  set: (v) => emit("update:searchNombre", v),
});

const hasFilters = computed(() => {
  return (
    !!props.searchNombre ||
    props.diagnostico.length > 0 ||
    props.discapacidad !== ""
  );
});

const clearFilters = () => {
  emit("update:searchNombre", "");
  emit("update:diagnostico", "");
  emit("update:discapacidad", "");
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.filters {
  display: flex;
  gap: 16px;
  flex: 1;
  flex-wrap: wrap;
  align-items: flex-end;
}

.field :deep(.adolescente-search) {
  max-width: 360px;
}

.toolbar input,
.toolbar select {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.9rem;
  background-color: #f8fafc;
  transition: all 0.15s ease;
}

.toolbar input:focus,
.toolbar select:focus {
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
}

.label-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toolbar input,
.toolbar select {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.9rem;
  background-color: #f8fafc;
  transition: all 0.15s ease;
}

.toolbar input:focus,
.toolbar select:focus {
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Contenedor botón limpiar */
.filter-actions {
  display: flex;
  align-items: flex-end;
}

/* Botón principal */
.btn-primary {
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 800;
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.25);
}

/* Botón limpiar */
.btn-clear {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  height: 42px;
  transition: all 0.15s ease;
}

.btn-clear:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.icon {
  margin-right: 6px;
}
</style>
