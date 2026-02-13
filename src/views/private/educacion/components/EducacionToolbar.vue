<template>
  <div class="toolbar">

    <div class="filters-container">
      
      <div class="row row-main">
        <div class="search-wrapper">
          <label class="label-text">Buscar adolescente</label>
          <AdolescenteSearch
            v-model="adolescenteIdInternal"
            :fetch-by-id="true"
            :label="''"
            placeholder="Nombre o cédula"
            @clear="clearAdolescente"
          />
        </div>
      </div>

      <div class="row row-secondary">
        <div class="filter-item">
          <label class="label-text">Estudia</label>
          <select
            :value="estudia"
            @change="$emit('update:estudia', $event.target.value)"
          >
            <option value="">Todos</option>
            <option value="1">Sí estudia</option>
            <option value="0">No estudia</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="label-text">Nivel</label>
          <input
            type="text"
            placeholder="Ej: Bachillerato"
            :value="nivel"
            @input="$emit('update:nivel', $event.target.value)"
          />
        </div>

        <div class="filter-item">
          <label class="label-text">Institución</label>
          <input
            type="text"
            placeholder="Ej: Colegio Nacional"
            :value="institucion"
            @input="$emit('update:institucion', $event.target.value)"
          />
        </div>
      </div>
    </div>

    <div class="actions">
      <button
        v-if="hasFilters"
        class="btn-clear-action"
        type="button"
        @click="clearFilters"
      >
        🧹 Limpiar
      </button>

      <button
        v-if="canEdit"
        class="btn-primary"
        type="button"
        @click="$emit('create')"
      >
        + Nuevo registro
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed } from "vue";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";

const props = defineProps({
  adolescenteId: { type: [Number, String, null], default: null },
  total: Number,
  estudia: { type: String, default: "" },
  nivel: { type: String, default: "" },
  institucion: { type: String, default: "" },
  canEdit: { type: Boolean, default: true },
});

const emit = defineEmits([
  "update:adolescenteId",
  "update:estudia",
  "update:nivel",
  "update:institucion",
  "create",
]);

const adolescenteIdInternal = computed({
  get: () => props.adolescenteId,
  set: (val) => emit("update:adolescenteId", val),
});

/* Detectar si hay filtros activos para mostrar el botón limpiar */
const hasFilters = computed(() => {
  return (
    props.adolescenteId !== null ||
    props.estudia !== "" ||
    props.nivel !== "" ||
    props.institucion !== ""
  );
});

const clearAdolescente = () => emit("update:adolescenteId", null);

/* Limpiar todos los filtros */
const clearFilters = () => {
  clearAdolescente();
  emit("update:estudia", "");
  emit("update:nivel", "");
  emit("update:institucion", "");
};
</script>

<style scoped>
/* Estructura base alineada con Jurídico/Salud */
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

/* Inputs y Selects consistentes */
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

/* Panel de botones derecha */
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

/* Botón Limpiar (Estilo Jurídico) */
.btn-clear-action {
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
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
}
</style>