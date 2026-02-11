<template>
  <div class="toolbar">
    <input
      type="text"
      placeholder="Buscar por detalle..."
      :value="search"
      @input="$emit('update:search', $event.target.value)"
    />

    <!-- Botón Limpiar (solo si hay búsqueda activa) -->
    <button
      v-if="search"
      class="btn-clear"
      @click="clearFilters"
    >
      <span class="icon">🧹</span>
      Limpiar
    </button>

    <button class="btn-primary" @click="$emit('create')">
      + Nueva Interacción
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  search: {
    type: String,
    default: "",
  },
  total: Number,
});

const emit = defineEmits(["update:search", "create"]);

const clearFilters = () => {
  emit("update:search", "");
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.toolbar input {
  flex: 1;
  min-width: 220px;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.95rem;
  background: #fff;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.toolbar input:focus {
  border-color: rgba(59, 130, 246, 0.55);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
}

/* Botón principal */
.toolbar .btn-primary {
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

.toolbar .btn-primary:hover {
  box-shadow: 0 18px 34px rgba(29, 78, 216, 0.24);
}

.toolbar .btn-primary:active {
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
