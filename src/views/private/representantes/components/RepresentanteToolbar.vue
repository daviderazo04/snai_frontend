<template>
  <div class="toolbar">
    <div class="filters">
      <label class="field">
        <span class="label-text">Nombre</span>
        <input
          type="text"
          :value="nombre"
          placeholder="Buscar por nombre"
          @input="$emit('update:nombre', $event.target.value)"
        />
      </label>

      <label class="field">
        <span class="label-text">Cédula</span>
        <input
          type="text"
          :value="cedula"
          placeholder="Buscar por cédula"
          @input="$emit('update:cedula', $event.target.value)"
        />
      </label>

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
      + Nuevo representante
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  nombre: {
    type: String,
    default: "",
  },
  cedula: {
    type: String,
    default: "",
  },
  canEdit: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:nombre", "update:cedula", "create"]);

const hasFilters = computed(() => props.nombre.length > 0 || props.cedula.length > 0);

const clearFilters = () => {
  emit("update:nombre", "");
  emit("update:cedula", "");
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
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
}

.label-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.9rem;
  background-color: #f8fafc;
  transition: all 0.15s ease;
}

input:focus {
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
