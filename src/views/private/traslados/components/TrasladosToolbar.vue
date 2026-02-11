<template>
  <div class="toolbar">
    <div class="title-block">
      <div>
        <h2>Listado de Traslados</h2>
        <p class="subtitle">{{ total }} registros disponibles</p>
      </div>

      <div class="actions-group">
        <button
          v-if="hasFilters"
          class="btn-clear"
          type="button"
          @click="clearFilters"
        >
          🧹 Limpiar
        </button>

        <button v-if="canEdit" class="btn-primary" type="button" @click="$emit('create')">
          + Nuevo traslado
        </button>
      </div>
    </div>

    <div class="filters">
      <label class="field">
        <span class="label">Buscar adolescente</span>
        <input
          type="search"
          placeholder="Nombre o cédula"
          :value="search"
          @input="$emit('update:search', $event.target.value)"
        />
      </label>

      <label class="field">
        <span class="label">Orden por fecha</span>
        <select :value="dateSort" @change="$emit('update:dateSort', $event.target.value)">
          <option value="desc">Más recientes</option>
          <option value="asc">Más antiguos</option>
        </select>
      </label>

      <label class="field">
        <span class="label">Desde</span>
        <input type="date" :value="dateFrom" @input="$emit('update:dateFrom', $event.target.value)" />
      </label>

      <label class="field">
        <span class="label">Hasta</span>
        <input type="date" :value="dateTo" @input="$emit('update:dateTo', $event.target.value)" />
      </label>

      <label class="field">
        <span class="label">Provincia</span>
        <select 
          :value="provinceId" 
          @change="$emit('update:province', $event.target.value ? Number($event.target.value) : '')" 
          :disabled="loading"
        >
          <option value="">Todas</option>
          <option v-for="p in listaProvincias" :key="p.id" :value="p.id">
            {{ p.nombre }}
          </option>
        </select>
      </label>

      <label class="field">
        <span class="label">Cantón</span>
        <select 
          :value="cantonId" 
          @change="$emit('update:canton', $event.target.value ? Number($event.target.value) : '')" 
          :disabled="loading"
        >
          <option value="">Todos</option>
          <option v-for="c in listaCantones" :key="c.id" :value="c.id">
            {{ c.nombre }}
          </option>
        </select>
      </label>

      <label class="field">
        <span class="label">CAI Destino</span>
        <select 
          :value="caiId" 
          @change="$emit('update:cai', $event.target.value ? Number($event.target.value) : '')" 
          :disabled="loading"
        >
          <option value="">Todos</option>
          <option v-for="c in listaCais" :key="c.id" :value="c.id">
            {{ c.nombre }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getProvincias } from "@/service/provincias.service";
import { getCantones } from "@/service/cantones.service";
import { getCais } from "@/service/cai.service";

const props = defineProps({
  search: String,
  total: Number,
  dateFrom: String,
  dateTo: String,
  dateSort: String,
  provinceId: [String, Number],
  cantonId: [String, Number],
  caiId: [String, Number],
  canEdit: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:search",
  "update:dateFrom",
  "update:dateTo",
  "update:dateSort",
  "update:province",
  "update:canton",
  "update:cai",
  "create"
]);

const listaProvincias = ref([]);
const listaCantones = ref([]);
const listaCais = ref([]);
const loading = ref(false);

const hasFilters = computed(() => {
  return (
    props.search ||
    props.dateFrom ||
    props.dateTo ||
    props.provinceId ||
    props.cantonId ||
    props.caiId
  );
});

const loadCatalogs = async () => {
  loading.value = true;
  try {
    const [resP, resC, resCai] = await Promise.all([
      getProvincias({ size: 1000 }),
      getCantones({ size: 1000 }),
      getCais({ size: 1000 })
    ]);
    listaProvincias.value = resP.data?.data || resP.data || [];
    listaCantones.value = resC.data?.data || resC.data || [];
    listaCais.value = resCai.data?.data || resCai.data || [];
  } catch (error) {
    console.error("Error cargando catálogos:", error);
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  emit("update:search", "");
  emit("update:dateFrom", "");
  emit("update:dateTo", "");
  emit("update:dateSort", "desc");
  emit("update:province", "");
  emit("update:canton", "");
  emit("update:cai", "");
};

onMounted(loadCatalogs);
</script>

<style scoped>
/* Estilos se mantienen igual */
.toolbar { display: flex; flex-direction: column; gap: 18px; }
.title-block { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.title-block h2 { margin: 0 0 4px; font-size: 1.2rem; color: #0f172a; }
.subtitle { margin: 0; color: #64748b; font-size: 0.9rem; }
.actions-group { display: flex; align-items: center; gap: 12px; }
.btn-primary { border: none; color: white; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: 600; background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25); transition: transform 0.2s, box-shadow 0.2s; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3); }
.btn-clear { padding: 10px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; font-weight: 600; color: #475569; transition: all 0.2s ease; }
.btn-clear:hover { background: #f1f5f9; border-color: #cbd5e1; }
.filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: #475569; }
.label { text-transform: uppercase; font-size: 0.72rem; letter-spacing: 1px; font-weight: 700; color: #64748b; }
.field input, .field select { padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-size: 0.95rem; color: #0f172a; }
.field input:focus, .field select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); }

@media (max-width: 720px) { 
  .title-block { flex-direction: column; align-items: flex-start; } 
  .actions-group { width: 100%; }
  .btn-primary, .btn-clear { flex: 1; }
}
</style>
