<template>
  <div class="toolbar">
    <div class="title-block">
      <div>
        <h2>Listado de cantones</h2>
        <p class="subtitle">{{ total }} registros disponibles</p>
      </div>

      <div class="buttons-right">
        <button
          v-if="localSearch || localProvinceId"
          type="button"
          class="btn-clear"
          @click="clearFilters"
        >
          🧹 Limpiar
        </button>

        <button class="primary" type="button" @click="$emit('create')">
          + Nuevo cantón
        </button>
      </div>
    </div>

    <div class="filters">
      <label class="field">
        <span class="label">Buscar</span>
        <input
          type="search"
          v-model="localSearch"
          placeholder="Nombre de cantón"
          @input="emitSearch"
        />
      </label>

      <label class="field">
        <span class="label">Provincia</span>
        <select v-model="localProvinceId" @change="emitProvince" :disabled="loadingProvincias">
          <option value="">{{ loadingProvincias ? 'Cargando...' : 'Todas las provincias' }}</option>
          <option v-for="provincia in listaProvincias" :key="provincia.id" :value="provincia.id">
            {{ provincia.nombre }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<script>
import { getProvincias } from "@/service/provincias.service";

export default {
  props: {
    search: {
      type: String,
      default: "",
    },
    provinceId: {
      type: [String, Number],
      default: "",
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:search", "update:province", "create"],
  data() {
    return {
      localSearch: this.search,
      localProvinceId: this.provinceId,
      listaProvincias: [],
      loadingProvincias: false,
    };
  },
  watch: {
    search(val) {
      this.localSearch = val;
    },
    provinceId(val) {
      this.localProvinceId = val;
    },
  },
  async mounted() {
    await this.loadProvincias();
  },
  methods: {
    async loadProvincias() {
      this.loadingProvincias = true;
      try {
        // Solicitamos un tamaño grande para obtener todas las provincias sin paginación
        const res = await getProvincias({ size: 1000 });
        this.listaProvincias = res.data?.data || res.data || [];
      } catch (error) {
        console.error("Error al cargar provincias en el toolbar:", error);
      } finally {
        this.loadingProvincias = false;
      }
    },
    emitSearch() {
      this.$emit("update:search", this.localSearch);
    },
    emitProvince() {
      this.$emit("update:province", this.localProvinceId);
    },
    clearFilters() {
      this.localSearch = "";
      this.localProvinceId = "";
      this.$emit("update:search", "");
      this.$emit("update:province", "");
    },
  },
};
</script>

<style scoped>
/* Se mantienen tus estilos originales */
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

.buttons-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  align-items: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: #475569;
}

.field input,
.field select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.95rem;
  color: #0f172a;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.btn-clear {
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  transition: background 0.15s ease;
  font-size: 0.85rem;
  height: 36px;
  white-space: nowrap;
}

.btn-clear:hover {
  background: #f1f5f9;
}

@media (max-width: 720px) {
  .title-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .buttons-right {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }

  .primary {
    width: 100%;
  }
}
</style>