<template>
  <div class="autocomplete-container" ref="autocompleteRef">
    <label class="label-text big-label">{{ label }}</label>
    <div class="input-wrapper">
      <input 
        type="text" 
        :placeholder="placeholder"
        v-model="query"
        @focus="onFocus"
        @input="onInput"
      />
      <span class="input-icon">▼</span>
    </div>

    <ul v-if="showList && suggestions.length" class="suggestions-list">
      <li 
        v-for="item in suggestions" 
        :key="item.id" 
        @click="selectItem(item)"
      >
        {{ item.nombre }}
      </li>
    </ul>
    <ul v-else-if="showList && query" class="suggestions-list">
      <li class="no-results">Sin resultados</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { getCais } from "@/service/cai.service";

const props = defineProps({
  modelValue: [Number, String, null],
  label: String,
  placeholder: { type: String, default: "Buscar centro..." }
});

const emit = defineEmits(["update:modelValue"]);

const query = ref("");
const showList = ref(false);
const allCais = ref([]);
const autocompleteRef = ref(null);

// Cargar datos una sola vez
onMounted(async () => {
  try {
    const res = await getCais({ size: 1000 });
    allCais.value = res.data?.data || res.data || [];
    // Si ya viene un ID por defecto, buscar el nombre
    syncQueryWithId();
  } catch (e) {
    console.error("Error cargando CAIs:", e);
  }
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));

// Lógica de filtrado (Muestra 5 siempre)
const suggestions = computed(() => {
  const search = query.value.toLowerCase().trim();
  if (!search) return allCais.value.slice(0, 5);
  return allCais.value
    .filter(c => c.nombre.toLowerCase().includes(search))
    .slice(0, 5);
});

const onFocus = () => { showList.value = true; };
const onInput = () => { 
  showList.value = true;
  if (!query.value) emit("update:modelValue", null);
};

const selectItem = (item) => {
  query.value = item.nombre;
  showList.value = false;
  emit("update:modelValue", item.id);
};

const syncQueryWithId = () => {
  if (props.modelValue && allCais.value.length) {
    const found = allCais.value.find(c => c.id === props.modelValue);
    if (found) query.value = found.nombre;
  } else if (!props.modelValue) {
    query.value = "";
  }
};

// Limpiar el texto si se resetea desde afuera
watch(() => props.modelValue, (newVal) => {
  if (!newVal) query.value = "";
  else syncQueryWithId();
});

const handleClickOutside = (e) => {
  if (autocompleteRef.value && !autocompleteRef.value.contains(e.target)) {
    showList.value = false;
  }
};
</script>

<style scoped>
.autocomplete-container { position: relative; width: 100%; display: flex; flex-direction: column; gap: 10px; }
.label-text { font-size: 0.85rem; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.8px; }

.input-wrapper { position: relative; width: 100%; }
.input-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); font-size: 0.7rem; color: #94a3b8; pointer-events: none; }

input {
  height: 48px; width: 100%; box-sizing: border-box; padding: 0 35px 0 16px;
  border-radius: 12px; border: 1px solid #cbd5e1; background: #ffffff;
  font-size: 1rem; transition: all 0.2s ease;
}
input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); outline: none; }

.suggestions-list {
  position: absolute; top: 100%; left: 0; right: 0; background: white;
  border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 15px 35px rgba(15, 23, 42, 0.15);
  z-index: 100; list-style: none; padding: 8px 0; margin: 8px 0 0; max-height: 250px; overflow-y: auto;
}
.suggestions-list li { padding: 14px 20px; cursor: pointer; font-size: 1rem; color: #1e293b; }
.suggestions-list li:hover { background: #f1f5f9; color: #2563eb; font-weight: 600; }
.no-results { color: #94a3b8; font-style: italic; }
</style>