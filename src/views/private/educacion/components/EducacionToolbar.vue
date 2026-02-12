<!-- src/views/private/educacion/components/EducacionToolbar.vue -->
<template>
  <div class="toolbar">
    <div class="title-block">
      <div>
        <h2>Listado de Educación</h2>
        <p class="subtitle">{{ total }} registros disponibles</p>
      </div>

      <div class="actions">
        <!-- Botón Limpiar (solo visible si hay filtros activos) -->
        <button
          v-if="hasFilters"
          class="btn-clear"
          type="button"
          @click="clearFilters"
        >
          🧹 Limpiar
        </button>

        <button v-if="canEdit" class="btn-primary" type="button" @click="$emit('create')">
          + Nuevo registro
        </button>
      </div>
    </div>

    <div class="filters">
      <label class="field">
        <span class="label">Buscar adolescente</span>
        <AdolescenteSearch
          v-model="adolescenteIdInternal"
          :fetch-by-id="true"
          :label="''"
          placeholder="Nombre o cédula"
          @clear="clearAdolescente"
        />
      </label>

      <label class="field">
        <span class="label">Estudia</span>
        <select
          :value="estudia"
          @change="$emit('update:estudia', $event.target.value)"
        >
          <option value="">Todos</option>
          <option value="1">Sí estudia</option>
          <option value="0">No estudia</option>
        </select>
      </label>

      <label class="field">
        <span class="label">Nivel</span>
        <input
          type="text"
          placeholder="Ej: Bachillerato"
          :value="nivel"
          @input="$emit('update:nivel', $event.target.value)"
        />
      </label>

      <label class="field">
        <span class="label">Institución</span>
        <input
          type="text"
          placeholder="Ej: Colegio Nacional"
          :value="institucion"
          @input="$emit('update:institucion', $event.target.value)"
        />
      </label>
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
  canEdit: {
    type: Boolean,
    default: true,
  },
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

/* Detectar si hay filtros activos */
const hasFilters = computed(() => {
  return (
    props.adolescenteId ||
    props.estudia ||
    props.nivel ||
    props.institucion
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
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.title-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title-block h2 {
  margin: 0 0 4px;
  font-size: 1.2rem;
  color: #0f172a;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Botón principal */
.btn-primary {
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.btn-primary:active {
  transform: translateY(1px);
}

/* Botón limpiar */
.btn-clear {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Filtros */
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: #475569;
}

.label {
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 1px;
  font-weight: 700;
  color: #64748b;
}

.field input,
.field select,
.field :deep(.adolescente-search) {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.95rem;
  color: #0f172a;
}

.field input:focus,
.field select:focus,
.field :deep(.adolescente-search input) {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

@media (max-width: 720px) {
  .title-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    width: 100%;
  }

  .btn-primary,
  .btn-clear {
    width: 100%;
  }
}
</style>
