<template>
  <div class="toolbar">
    <div class="filters">
      <AdolescenteSearch
          v-model="adolInternal"
          :fetch-by-id="true"
          :label="''"
          placeholder="Buscar adolescente..."
          @clear="clearAdolescente"
      />


      <div class="autocomplete search-adol">

      </div>

      <div class="autocomplete" ref="delitoRef">
        <input
            type="text"
            placeholder="Buscar por N° de causa..."
            v-model="localTermino"
            @input="emitTermino"
        />
        <input
          type="text"
          placeholder="Buscar delito..."
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

      <button
        v-if="hasFilters"
        class="btn-clear"
        @click="clearFilters"
        type="button"
      >
        扫 Limpiar
      </button>
    </div>

    <button v-if="canEdit" class="btn-primary" @click="$emit('create')" type="button">
      + Nuevo Registro
    </button>
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
  canEdit: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:termino",
  "update:adolescenteId",
  "update:delitoId",
  "create",
]);

/* ================= STATE ================= */

const localTermino = ref(props.termino || "");
const delitoQuery = ref("");

const delitos = ref([]);

const showDelitos = ref(false);
const adolInternal = computed({
  get: () => props.adolescenteId,
  set: (v) => emit("update:adolescenteId", v),
});

/* ================= DETECTAR FILTROS ================= */

const hasFilters = computed(() => {
  return (
    localTermino.value ||
    delitoQuery.value ||
    props.adolescenteId ||
    props.delitoId
  );
});

/* ================= WATCH ================= */

watch(() => props.termino, v => localTermino.value = v || "");

/* ================= LOAD DELITOS (Carga Completa) ================= */

const loadDelitos = async () => {
  // Traemos 1000 para asegurar que el filtro por nombre encuentre todo
  const { data } = await getDelitos({ size: 1000 }); 
  delitos.value = data?.data ?? data ?? [];
};

onMounted(loadDelitos);

/* ================= FILTRO DELITOS EN MEMORIA ================= */

const filteredDelitos = computed(() =>
  delitos.value
    .filter(d =>
      d.nombre.toLowerCase().includes(delitoQuery.value.toLowerCase())
    )
    .slice(0, 5) // Solo mostramos los primeros 5 para mantener limpia la UI
);

/* ================= SELECT ================= */

const selectDelito = (d) => {
  delitoQuery.value = d.nombre;
  showDelitos.value = false;
  emit("update:delitoId", d.id);
};

/* ================= EMIT ================= */

const emitTermino = () => {
  emit("update:termino", localTermino.value || "");
};

/* ================= CLEAR ================= */

const clearFilters = () => {
  localTermino.value = "";
  delitoQuery.value = "";

  showDelitos.value = false;

  emit("update:termino", "");
  emit("update:adolescenteId", null);
  emit("update:delitoId", null);
};

/* ================= CLICK OUTSIDE ================= */

const delitoRef = ref(null);

const handleClickOutside = (e) => {
  if (delitoRef.value && !delitoRef.value.contains(e.target)) {
    showDelitos.value = false;
  }
};

const clearAdolescente = () => emit("update:adolescenteId", null);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.search-adol :deep(.adolescente-search) {
  max-width: 320px;
}

.toolbar input {
  min-width: 180px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.95rem;
}

.toolbar input:focus {
  border-color: rgba(59, 130, 246, 0.55);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
}

.no-results {
  padding: 10px 16px;
  color: #94a3b8;
  font-style: italic;
  font-size: 0.85rem;
}

/* Botones */
.btn-primary {
  border: none;
  color: white;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  background: linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%);
}

.btn-clear {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  transition: background 0.15s ease;
}

.btn-clear:hover {
  background: #f1f5f9;
}

/* ================= AUTOCOMPLETE ================= */

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
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
  animation: fadeDown 0.15s ease-out;
  list-style: none;
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

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
