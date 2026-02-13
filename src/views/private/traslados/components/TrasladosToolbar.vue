<template>
  <div class="toolbar">
    <div class="filters-container">
      
      <div class="row row-main">
        <div class="search-wrapper">
          <label class="label-text big-label">Buscar adolescente</label>
          <AdolescenteSearch
            v-model="adolInternal"
            :fetch-by-id="true"
            :label="''"
            placeholder="Nombre o cédula del adolescente..."
            @clear="clearAdolescente"
          />
        </div>
      </div>

      <div class="row row-double">
        <CaiAutocomplete 
          label="CAI Origen" 
          placeholder="Escriba para buscar origen..."
          v-model="caiFromIdInternal"
        />
        <CaiAutocomplete 
          label="CAI Destino" 
          placeholder="Escriba para buscar destino..."
          v-model="caiToIdInternal"
        />
      </div>

      <div class="row row-double">
        <div class="filter-item">
          <label class="label-text big-label">Fecha Desde</label>
          <input 
            type="date" 
            :value="dateFrom" 
            @input="$emit('update:dateFrom', $event.target.value)" 
          />
        </div>

        <div class="filter-item">
          <label class="label-text big-label">Fecha Hasta</label>
          <input 
            type="date" 
            :value="dateTo" 
            @input="$emit('update:dateTo', $event.target.value)" 
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
        + Nuevo traslado
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";
import CaiAutocomplete from "@/components/CAIs/CaiAutocomplete.vue";

const props = defineProps({
  search: [String, Number, null],
  dateFrom: String,
  dateTo: String,
  caiFromId: [String, Number, null],
  caiToId: [String, Number, null],
  canEdit: { type: Boolean, default: true },
});

const emit = defineEmits([
  "update:search", 
  "update:dateFrom", 
  "update:dateTo", 
  "update:caiFrom", 
  "update:caiTo", 
  "create"
]);

/* ================= COMPUTED (Binding Limpio) ================= */

const adolInternal = computed({
  get: () => props.search,
  set: (val) => emit("update:search", val),
});

const caiFromIdInternal = computed({
  get: () => props.caiFromId,
  set: (val) => emit("update:caiFrom", val),
});

const caiToIdInternal = computed({
  get: () => props.caiToId,
  set: (val) => emit("update:caiTo", val),
});

const hasFilters = computed(() => {
  return !!(
    (props.search !== null && props.search !== "") || 
    props.dateFrom || 
    props.dateTo || 
    props.caiFromId || 
    props.caiToId
  );
});

/* ================= MÉTODOS ================= */

const clearFilters = () => {
  emit("update:search", null);
  emit("update:dateFrom", "");
  emit("update:dateTo", "");
  emit("update:caiFrom", null);
  emit("update:caiTo", null);
};

const clearAdolescente = () => emit("update:search", null);
</script>

<style scoped>
/* Estructura Principal */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  padding: 15px 0;
}

.filters-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 25px; /* Más espacio entre filas */
}

/* Filas y Cuadrícula */
.row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.row-main {
  width: 100%;
}

.row-double {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Dos columnas iguales */
  gap: 25px;
  max-width: 950px; /* Un poco más ancho */
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Estilo de Labels (Grandes y Negritas) */
.label-text.big-label {
  font-size: 0.85rem !important;
  font-weight: 800 !important;
  color: #334155 !important;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* Estilo de Inputs (Grandes y Blancos) */
input {
  height: 48px !important;
  box-sizing: border-box;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s ease;
}

input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  outline: none;
}

/* Panel de Acciones (Derecha) */
.actions {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-top: 35px; /* Alineado visualmente con el centro de las filas */
}

.btn-primary {
  height: 50px;
  padding: 0 30px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  cursor: pointer;
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.25);
  white-space: nowrap;
}

.btn-clear-action {
  height: 50px;
  padding: 0 24px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.btn-clear-action:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

/* Responsive */
@media (max-width: 850px) {
  .row-double {
    grid-template-columns: 1fr; /* Una columna en pantallas pequeñas */
  }
  .toolbar {
    flex-direction: column;
  }
  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>