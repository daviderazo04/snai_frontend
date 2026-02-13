<template>
  <div class="toolbar">
    <div class="filters">
      <div class="search-block">
        <AdolescenteSearch
          v-model="internalAdolescenteId"
          :fetch-by-id="true"
          :label="''"
          placeholder="Buscar adolescente"
          @clear="clearAdolescente"
        />
      </div>

      <div class="search-block">
        <RepresentanteSearch
          v-model="internalRepresentanteId"
          :label="''"
          placeholder="Buscar representante"
          @clear="clearRepresentante"
        />
      </div>

      <button
        v-if="hasFilters"
        class="btn-clear"
        type="button"
        @click="clearFilters"
      >
        🧹 Limpiar
      </button>
    </div>

    <button
      v-if="canEdit"
      class="btn-primary"
      type="button"
      @click="$emit('create')"
    >
      + Nuevo vínculo
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";
import RepresentanteSearch from "@/components/representante/RepresentanteSearch.vue";

const props = defineProps({
  adolescenteId: {
    type: [Number, String, null],
    default: null,
  },
  representanteId: {
    type: [Number, String, null],
    default: null,
  },
  canEdit: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:adolescenteId", "update:representanteId", "create"]);

const internalAdolescenteId = computed({
  get: () => props.adolescenteId,
  set: (val) => emit("update:adolescenteId", val),
});

const internalRepresentanteId = computed({
  get: () => props.representanteId,
  set: (val) => emit("update:representanteId", val),
});

const hasFilters = computed(() => Boolean(props.adolescenteId || props.representanteId));

const clearAdolescente = () => {
  emit("update:adolescenteId", null);
};

const clearRepresentante = () => {
  emit("update:representanteId", null);
};

const clearFilters = () => {
  clearAdolescente();
  clearRepresentante();
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
  flex: 1;
}

.search-block {
  min-width: 280px;
  flex: 1 1 280px;
}

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
</style>
