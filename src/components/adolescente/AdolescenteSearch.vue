<template>
  <div class="adolescente-search">
    <label v-if="label" class="label">{{ label }}</label>

    <div v-if="!isLocked || !hideControlsWhenDisabled" class="controls">
      <select v-model="searchMode" :disabled="isLocked">
        <option value="nombre">Nombre</option>
        <option value="cedula">Cédula</option>
      </select>

      <div class="input-wrap">
        <input
          :placeholder="placeholder"
          :disabled="isLocked"
          v-model="query"
          @focus="handleFocus"
        />
        <button
          v-if="selectedLabel && !isLocked"
          type="button"
          class="clear-btn"
          @click="clearSelection"
        >
          ×
        </button>
      </div>
    </div>

    <div class="dropdown" v-if="showDropdown">
      <div class="dropdown-body">
        <div v-if="isLoading" class="hint">Buscando...</div>
        <template v-else>
          <div
            v-for="opt in results"
            :key="opt.id"
            class="option"
            @click="select(opt)"
          >
            {{ opt.label }}
          </div>
          <div v-if="!results.length" class="hint">Sin resultados</div>
        </template>
      </div>
    </div>

    <div v-if="selectedLabel" class="selected-hint">
      <span class="name">{{ selectedRaw?.nombre }} {{ selectedRaw?.apellido }}</span>
      <div class="meta">
        <span v-if="selectedRaw?.cedula">Cédula: {{ selectedRaw.cedula }}</span>
        <span v-if="selectedRaw?.cai?.nombre">CAI: {{ selectedRaw.cai.nombre }}</span>
        <span v-else>CAI: —</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from "vue";
import { getAdolescentes, getAdolescenteById } from "@/service/adolescente.service";

const props = defineProps({
  modelValue: {
    type: [Number, String, null],
    default: null,
  },
  initialLabel: {
    type: String,
    default: "",
  },
  initialRaw: {
    type: Object,
    default: null,
  },
  placeholder: {
    type: String,
    default: "Buscar adolescente...",
  },
  label: {
    type: String,
    default: "Adolescente",
  },
  pageSize: {
    type: Number,
    default: 15,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hideControlsWhenDisabled: {
    type: Boolean,
    default: false,
  },
  fetchById: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "selected", "clear"]);

const searchMode = ref("nombre"); // nombre | cedula
const query = ref("");
const results = ref([]);
const isLoading = ref(false);
const showDropdown = ref(false);
const selectedLabel = ref(props.initialLabel);
const selectedRaw = ref(props.initialRaw);
const isLocked = computed(() => props.disabled);
let searchTimer = null;
let loadingExisting = false;

const buildParams = () => {
  const params = { page: 1, size: props.pageSize };
  if (searchMode.value === "cedula") {
    params.cedula = query.value || undefined;
  } else {
    params.nombre = query.value || undefined;
  }
  return params;
};

const search = async () => {
  isLoading.value = true;
  try {
    const res = await getAdolescentes(buildParams());
    const data = res?.data?.data || res?.data || res || [];
    results.value = Array.isArray(data)
      ? data.map((a) => {
          const name = `${a.nombre || ""} ${a.apellido || ""}`.trim();
          const ced = a.cedula ? ` (${a.cedula})` : "";
          const cai = a.cai?.nombre ? ` · CAI: ${a.cai.nombre}` : "";
          return {
            id: a.id,
            label: `${name}${ced}${cai}`.trim(),
            raw: a,
          };
        })
      : [];
  } catch (e) {
    console.error("Error buscando adolescentes:", e);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
};

const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(search, 250);
};

const handleFocus = () => {
  if (isLocked.value) return;
  showDropdown.value = true;
  debouncedSearch();
};

const select = (opt) => {
  if (isLocked.value) return;
  if (!opt) return;
  selectedLabel.value = opt.label;
  selectedRaw.value = opt.raw || null;
  emit("update:modelValue", opt.id);
  emit("selected", opt);
  showDropdown.value = false;
};

const clearSelection = () => {
  if (isLocked.value) return;
  selectedLabel.value = "";
  query.value = "";
  selectedRaw.value = null;
  emit("update:modelValue", null);
  emit("clear");
  showDropdown.value = false;
};

watch(query, () => {
  if (!showDropdown.value) showDropdown.value = true;
  debouncedSearch();
});

watch(
  () => props.modelValue,
  async (val) => {
    if (val == null) {
      selectedLabel.value = "";
      selectedRaw.value = null;
      return;
    }

    // Si ya tenemos raw correspondiente, no refetch
    if (selectedRaw.value && Number(selectedRaw.value.id) === Number(val)) return;
    if (!props.fetchById) return;
    if (loadingExisting) return;

    loadingExisting = true;
    try {
      const res = await getAdolescenteById(val);
      const a = res?.data?.data ?? res?.data ?? res;
      if (a && a.id) {
        selectedRaw.value = a;
        const name = `${a.nombre || ""} ${a.apellido || ""}`.trim();
        const ced = a.cedula ? ` (${a.cedula})` : "";
        const cai = a.cai?.nombre ? ` · CAI: ${a.cai.nombre}` : "";
        selectedLabel.value = `${name}${ced}${cai}`.trim();
      }
    } catch (e) {
      console.error("No se pudo cargar adolescente por id:", e);
    } finally {
      loadingExisting = false;
    }
  }
);

watch(
  () => props.initialLabel,
  (val) => {
    if (props.modelValue && val) selectedLabel.value = val;
  }
);

watch(
  () => props.initialRaw,
  (val) => {
    selectedRaw.value = val || null;
    if (val && !props.initialLabel) {
      const name = `${val.nombre || ""} ${val.apellido || ""}`.trim();
      const ced = val.cedula ? ` (${val.cedula})` : "";
      const cai = val.cai?.nombre ? ` · CAI: ${val.cai.nombre}` : "";
      selectedLabel.value = `${name}${ced}${cai}`.trim();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<style scoped>
.adolescente-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-weight: 700;
  color: #334155;
  font-size: 0.85rem;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

select {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-weight: 600;
  color: #0f172a;
}

.input-wrap {
  position: relative;
  flex: 1;
}

.input-wrap input {
  width: 100%;
  padding: 10px 38px 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 0.95rem;
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  cursor: pointer;
}

.dropdown {
  position: relative;
}

.dropdown-body {
  position: absolute;
  z-index: 20;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  width: 100%;
  max-height: 240px;
  overflow-y: auto;
  padding: 6px;
}

.option {
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.option:hover {
  background: #eff6ff;
  color: #2563eb;
}

.hint {
  padding: 10px 12px;
  color: #64748b;
  font-size: 0.9rem;
}

.selected-hint {
  margin: 8px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-hint .name {
  font-weight: 800;
  font-size: 1rem;
}

.selected-hint .meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: #475569;
}
</style>
