<template>
  <div class="toolbar">
    <div class="filters">
      <input
        type="text"
        :value="nombre"
        placeholder="Buscar por nombre..."
        @input="$emit('update:nombre', $event.target.value)"
      />
      <input
        type="text"
        :value="cedula"
        placeholder="Buscar por cédula..."
        @input="$emit('update:cedula', $event.target.value)"
      />
    </div>

    <div class="actions-block">
      <span class="count">{{ total }} resultados</span>

      <!-- Botón Limpiar (solo visible si hay filtros activos) -->
      <button
        v-if="nombre || cedula"
        class="btn-clear"
        @click="clearFilters"
      >
        <span class="icon">🧹</span>
        Limpiar
      </button>

      <button class="btn-primary" @click="$emit('create')">
        + Nuevo Adolescente
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    nombre: { type: String, default: "" },
    cedula: { type: String, default: "" },
    total: { type: Number, default: 0 },
  },

  emits: ["update:nombre", "update:cedula", "create"],

  methods: {
    clearFilters() {
      this.$emit("update:nombre", "");
      this.$emit("update:cedula", "");
    },
  },
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  background: white;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.filters {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 300px;
}

.filters input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.filters input:focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.actions-block {
  display: flex;
  align-items: center;
  gap: 16px;
}

.count {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* Botón principal */
.btn-primary {
  border: none;
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  background: linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

/* Botón limpiar */
.btn-clear {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  background: #eef2f7;
  border-color: #cbd5e1;
}

@media (max-width: 640px) {
  .filters {
    flex-direction: column;
    width: 100%;
  }

  .actions-block {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
