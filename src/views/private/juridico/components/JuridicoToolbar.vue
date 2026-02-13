<template>
  <div class="toolbar">

    <div class="filters-container">
      
      <div class="row row-adolescente">
        <div class="search-wrapper">
          <AdolescenteSearch
            v-model="adolInternal"
            :fetch-by-id="true"
            :label="''"
            placeholder="Buscar adolescente..."
            @clear="clearAdolescente"
          />
        </div>
      </div>

      <div class="row row-secondary">
        <div class="filter-item">
          <input
            type="text"
            placeholder="N° de causa"
            v-model="localTermino"
            @input="emitTermino"
          />
        </div>

        <div class="filter-item autocomplete" ref="delitoRef">
          <input
            type="text"
            placeholder="Delito"
            v-model="delitoQuery"
            @input="showDelitos = true"
            @focus="showDelitos = true"
          />

          <ul v-if="showDelitos && (delitoQuery || filteredDelitos.length)">
            <li
              v-for="d in filteredDelitos"
              :key="d.id"
              @click="selectDelito(d)"
            >
              {{ d.nombre }}
            </li>
            <li v-if="!filteredDelitos.length" class="no-results">
              Sin resultados
            </li>
          </ul>
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
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { getDelitos } from "@/service/delito.service";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";

const props = defineProps({
  termino: String,
  adolescenteId: [Number, String, null],
  delitoId: Number,
  canEdit: { type: Boolean, default: true },
});

const emit = defineEmits(["update:termino", "update:adolescenteId", "update:delitoId", "create"]);

const localTermino = ref(props.termino || "");
const delitoQuery = ref("");
const delitos = ref([]);
const showDelitos = ref(false);

const adolInternal = computed({
  get: () => props.adolescenteId,
  set: (v) => emit("update:adolescenteId", v),
});

const hasFilters = computed(() => {
  return !!(localTermino.value || delitoQuery.value || props.adolescenteId || props.delitoId);
});

watch(() => props.termino, v => localTermino.value = v || "");

const loadDelitos = async () => {
  const { data } = await getDelitos({ size: 1000 });
  delitos.value = data?.data ?? data ?? [];
};

onMounted(loadDelitos);

const filteredDelitos = computed(() =>
  delitos.value
    .filter(d => d.nombre.toLowerCase().includes(delitoQuery.value.toLowerCase()))
    .slice(0, 5)
);

const selectDelito = (d) => {
  delitoQuery.value = d.nombre;
  showDelitos.value = false;
  emit("update:delitoId", d.id);
};

const emitTermino = () => { emit("update:termino", localTermino.value || ""); };

const clearFilters = () => {
  localTermino.value = "";
  delitoQuery.value = "";
  showDelitos.value = false;
  emit("update:termino", "");
  emit("update:adolescenteId", null);
  emit("update:delitoId", null);
};

const clearAdolescente = () => { emit("update:adolescenteId", null); };

const delitoRef = ref(null);
const handleClickOutside = (e) => {
  if (delitoRef.value && !delitoRef.value.contains(e.target)) showDelitos.value = false;
};

onMounted(() => { document.addEventListener("click", handleClickOutside); });
onBeforeUnmount(() => { document.removeEventListener("click", handleClickOutside); });
</script>

<style scoped>
/* ================= TOOLBAR ================= */
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

.row-adolescente {
  width: 100%;
}

.row-secondary {
  gap: 12px;
}

.row-secondary .filter-item {
  flex: 0 0 auto;
}

/* Estilos originales de inputs de Delito/Causa */
.row-secondary input {
  width: 220px;
  height: 40px;
  font-size: 0.9rem;
}

input {
  height: 44px;
  width: 100%;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ================= AUTOCOMPLETE DELITO ================= */
.autocomplete {
  position: relative;
}

.autocomplete ul {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
  padding: 6px 0;
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
}

.autocomplete ul li {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1e293b;
}

.autocomplete ul li:hover {
  background: #f1f5f9;
}

.no-results {
  padding: 10px 16px;
  color: #94a3b8;
  font-style: italic;
  font-size: 0.85rem;
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
  height: 44px;
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