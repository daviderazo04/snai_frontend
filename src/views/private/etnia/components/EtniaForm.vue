<template>
  <div class="form-card">
    <form @submit.prevent="submit">
      <div class="card-body">
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input
            id="nombre"
            v-model="form.nombre"
            type="text"
            class="input-field"
            placeholder="Ingrese el nombre"
            required
            :disabled="loading"
          />
        </div>
      </div>

      <div class="card-footer">
        <button 
          type="submit" 
          class="btn-primary" 
          :class="{ 'is-loading': loading }"
          :disabled="loading"
        >
          <svg v-if="loading" class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          
          <span>{{ loading ? 'Guardando...' : 'Guardar' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  modelValue: Object,
  loading: Boolean
});

const emit = defineEmits(['submit']);

const form = reactive({
  nombre: ''
});

// Mantenemos tu lógica original intacta
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.nombre = val.nombre ?? '';
    }
  },
  { immediate: true }
);

const submit = () => {
  emit('submit', { ...form });
};
</script>

<style scoped>
/* Contenedor tipo Tarjeta */
.form-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 600px; /* Ancho máximo para que no se estire demasiado */
}

.card-body {
  padding: 24px;
}

.card-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end; /* Alinea el botón a la derecha */
}

/* Inputs y Labels */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.input-field {
  padding: 10px 12px;
  font-size: 0.95rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #0f172a;
  background: #fff;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-field:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Botón Principal con estado de carga */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #93c5fd; /* Azul más claro */
  cursor: not-allowed;
}

/* Spinner Animation */
.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>