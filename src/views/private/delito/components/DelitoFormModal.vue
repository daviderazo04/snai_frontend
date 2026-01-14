<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nuevo Delito" : "Editar Delito" }}</h3>
            <p class="subtitle">Ingrese el nombre de la infracción o delito</p>
          </div>
          <button class="btn-close" type="button" @click="$emit('close')" title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form class="form-content" @submit.prevent="save">
          <div class="modal-body">
            <label class="field">
              <span>Nombre del Delito <span class="required">*</span></span>
              <input 
                v-model="nombre" 
                type="text" 
                placeholder="Ej: Robo, Hurto..." 
                required
                autofocus
              />
            </label>
          </div>

          <div class="actions">
            <button class="btn-ghost" type="button" @click="$emit('close')">
              Cancelar
            </button>
            <button 
              class="btn-primary" 
              type="submit"
              :disabled="saving || !canSave" 
            >
              <span v-if="saving">Guardando...</span>
              <span v-else>Guardar</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  open: Boolean,
  mode: String,
  initialData: Object,
  saving: Boolean,
});

const emit = defineEmits(["close", "save"]);
const nombre = ref("");

watch(
  () => props.initialData,
  (val) => (nombre.value = val?.nombre ?? ""),
  { immediate: true }
);

const canSave = computed(() => Boolean(nombre.value && nombre.value.trim().length > 0));

const save = () => {
  if (canSave.value) {
    emit("save", { nombre: nombre.value.trim() });
  }
};
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal, .modal-fade-leave-active .modal { transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fade-enter-from .modal { transform: scale(0.95) translateY(10px); }
.modal-fade-leave-to .modal { transform: scale(0.98) translateY(10px); }

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; padding: 16px; z-index: 60;
}

.modal {
  width: min(500px, 94vw); background: white; border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8); display: flex; flex-direction: column;
}

.modal-header {
  padding: 24px 24px 0 24px; display: flex; justify-content: space-between; align-items: flex-start;
}
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }

.btn-close {
  background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 50%;
  color: #94a3b8; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; margin-top: -8px; margin-right: -8px;
}
.btn-close:hover { background: #f1f5f9; color: #ef4444; }

.form-content { display: flex; flex-direction: column; flex: 1; }
.modal-body { padding: 24px; }

.field { display: flex; flex-direction: column; gap: 8px; }
.field span { font-size: 0.8rem; font-weight: 600; color: #334155; margin-left: 2px; }
.required { color: #ef4444; }

.field input {
  width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0;
  outline: none; font-size: 0.95rem; color: #0f172a; background: #f8fafc;
  transition: all 0.2s ease;
}
.field input:focus { background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); position: relative; z-index: 2; }

.actions {
  display: flex; justify-content: flex-end; gap: 12px; padding: 0 24px 24px 24px;
  background: transparent; margin-bottom: 24px;
}
.actions button {
  padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 600;
  font-size: 0.95rem; transition: all 0.2s ease;
}
.btn-ghost { border: 1px solid transparent; background: transparent; color: #64748b; }
.btn-ghost:hover { background: #f1f5f9; color: #334155; }
.btn-primary {
  border: none; color: white; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
.btn-primary:hover:not(:disabled) { opacity: 0.95; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.2); }
</style>