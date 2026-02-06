<template>
  <div class="toolbar">
    <div class="filters">

      <!-- N° de causa -->
      <input
        type="text"
        placeholder="Buscar por N° de causa..."
        v-model="localTermino"
        @input="emitTermino"
      />

      <!-- Adolescente -->
      <div class="autocomplete" ref="adolescenteRef">
        <input
          type="text"
          placeholder="Adolescente..."
          v-model="adolescenteQuery"
          @focus="loadAdolescentesDefault"
        />

        <ul v-if="showAdolescentes">
          <li
            v-for="a in adolescentes"
            :key="a.id"
            @click="selectAdolescente(a)"
          >
            {{ a.label }}
          </li>

          <li v-if="!adolescentes.length">
            Sin resultados
          </li>
        </ul>
      </div>

      <!-- Delito -->
      <div class="autocomplete" ref="delitoRef">
        <input
          type="text"
          placeholder="Delito..."
          v-model="delitoQuery"
          @focus="showDelitos = true"
        />

        <ul v-if="showDelitos">
          <li
            v-for="d in filteredDelitos"
            :key="d.id"
            @click="selectDelito(d)"
          >
            {{ d.nombre }}
          </li>

          <li v-if="!filteredDelitos.length">
            Sin resultados
          </li>
        </ul>
      </div>

      <!-- Limpiar -->
      <button class="btn-clear" @click="clearFilters">
        <span class="icon">🧹</span>
        Limpiar
      </button>
    </div>

    <button class="btn-primary" @click="$emit('create')">
      + Nuevo Registro
    </button>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { getAdolescentes } from "@/service/adolescente.service";
import { getDelitos } from "@/service/delito.service";

const props = defineProps({
  termino: String,
  adolescenteId: Number,
  delitoId: Number,
});

const emit = defineEmits([
  "update:termino",
  "update:adolescenteId",
  "update:delitoId",
  "create",
]);

/* ================= STATE ================= */

const localTermino = ref(props.termino || "");
const adolescenteQuery = ref("");
const delitoQuery = ref("");

const adolescentes = ref([]);
const delitos = ref([]);

const showAdolescentes = ref(false);
const showDelitos = ref(false);

/* ================= WATCH ================= */

watch(() => props.termino, v => localTermino.value = v || "");

/* ================= LOAD ================= */

const loadDelitos = async () => {
  const { data } = await getDelitos();
  delitos.value = data?.data ?? data ?? [];
};

onMounted(loadDelitos);

const loadAdolescentesDefault = async () => {
  showAdolescentes.value = true;

  const res = await getAdolescentes({ page: 1, size: 10 });
  const data = res.data?.data ?? [];

  adolescentes.value = data.map(a => ({
    id: a.id,
    label: `${a.nombre} ${a.apellido}`,
  }));
};

/* ================= FILTER ================= */

const filteredDelitos = computed(() =>
  delitos.value.filter(d =>
    d.nombre.toLowerCase().includes(delitoQuery.value.toLowerCase())
  )
);

/* ================= SELECT ================= */

const selectAdolescente = (a) => {
  adolescenteQuery.value = a.label;
  showAdolescentes.value = false;
  emit("update:adolescenteId", a.id);
};

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
  adolescenteQuery.value = "";
  delitoQuery.value = "";

  showAdolescentes.value = false;
  showDelitos.value = false;

  emit("update:termino", "");
  emit("update:adolescenteId", null);
  emit("update:delitoId", null);
};

/* ================= CLICK OUTSIDE ================= */

const adolescenteRef = ref(null);
const delitoRef = ref(null);

const handleClickOutside = (e) => {
  if (adolescenteRef.value && !adolescenteRef.value.contains(e.target)) {
    showAdolescentes.value = false;
  }
  if (delitoRef.value && !delitoRef.value.contains(e.target)) {
    showDelitos.value = false;
  }
};

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
}

.btn-clear:hover {
  background: #f1f5f9;
}

/* ================= AUTOCOMPLETE ================= */

.autocomplete {
  position: relative;
}

.autocomplete input {
  position: relative;
  z-index: 2;
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
}

.autocomplete ul li {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.9rem;
}

.autocomplete ul li:hover {
  background: #f1f5f9;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
