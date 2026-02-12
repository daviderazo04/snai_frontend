<!-- OcupacionToolbar.vue -->
<template>
  <div class="toolbar">
    <div class="filters">
      <label class="field">
        <span class="label">Adolescente</span>
        <AdolescenteSearch
          v-model="adolInternal"
          :fetch-by-id="true"
          :label="''"
          placeholder="Buscar por nombre o cédula"
          @clear="clearFilters"
        />
      </label>

      <label class="field">
        <span class="label">Buscar ocupación</span>
        <input
          type="text"
          placeholder="Nombre del taller o actividad"
          :value="search"
          @input="$emit('update:search', $event.target.value)"
        />
      </label>
    </div>

    <div class="actions">
      <button
        v-if="search || adolInternal"
        class="btn-clear"
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
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.field input {
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.95rem;
  background: #fff;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.field input:focus,
.field :deep(.adolescente-search input) {
  border-color: rgba(59, 130, 246, 0.55);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

/* Botón principal */
.btn-primary {
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

.btn-primary:hover {
  box-shadow: 0 18px 34px rgba(29, 78, 216, 0.24);
}

.btn-primary:active {
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
</style>
