<template>
  <div class="toolbar">

    <div class="filters-container">
      
      <div class="row row-main">
        <div class="search-wrapper">
          <AdolescenteSearch
            v-model="adolInternal"
            :fetch-by-id="true"
            :label="''"
            placeholder="Buscar por nombre o cédula..."
            @clear="clearAdolescente"
          />
        </div>
      </div>

      <div class="row row-secondary">
        <div class="filter-item">
          <label class="label-text">Diagnóstico</label>
          <input
            type="text"
            placeholder="Ej: Gripe..."
            :value="diagnostico"
            @input="$emit('update:diagnostico', $event.target.value)"
          />
        </div>

        <div class="filter-item">
          <label class="label-text">¿Discapacidad?</label>
          <select
            :value="discapacidad"
            @change="$emit('update:discapacidad', $event.target.value)"
          >
            <option value="">Todos</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </div>
      </div>
    </div>

    <div class="actions">
      <button
        v-if="hasFilters"
        class="btn-clear-action"
        @click="clearFilters"
        type="button"
      >
        🧹 Limpiar
      </button>

      <button
        v-if="canEdit"
        class="btn-primary"
        @click="$emit('create')"
        type="button"
      >
        + Nuevo Registro
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed } from "vue";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";

const props = defineProps({
  searchNombre: { 
    type: [String, Number, null], 
    default: null 
  },
  diagnostico: { 
    type: String, 
    default: "" 
  },
  discapacidad: { 
    type: String, 
    default: "" 
  },
  canEdit: { 
    type: Boolean, 
    default: true 
  },
});

const emit = defineEmits([
  "update:searchNombre",
  "update:diagnostico",
  "update:discapacidad",
  "create",
]);

/* ================= STATE ================= */

const adolInternal = computed({
  get: () => props.searchNombre,
  set: (v) => emit("update:searchNombre", v),
});

/* ================= LÓGICA DE FILTROS ================= */

const hasFilters = computed(() => {
  return (
    props.searchNombre !== null && props.searchNombre !== "" || 
    props.diagnostico.length > 0 || 
    props.discapacidad !== ""
  );
});

/* ================= MÉTODOS ================= */

const clearFilters = () => {
  emit("update:searchNombre", null);
  emit("update:diagnostico", "");
  emit("update:discapacidad", "");
};

const clearAdolescente = () => {
  emit("update:searchNombre", null);
};
</script>

<style scoped>
/* ================= TOOLBAR (Estilo Jurídico) ================= */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  padding: 10px 0;
}

/* ================= FILTROS ================= */
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
}

.row-main {
  width: 100%;
}

.row-secondary .filter-item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Labels estilo Jurídico */
.label-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Inputs y Selects */
.row-secondary input,
.row-secondary select {
  width: 220px;
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

input:focus, select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ================= ACCIONES (DERECHA) ================= */
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
}

.btn-clear-action {
  height: 44px; /* Misma altura que el botón primario */
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-clear-action:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}
</style>