<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nuevo Registro de Salud" : "Editar Registro" }}</h3>
            <p class="subtitle">Ingrese los datos clínicos del adolescente</p>
          </div>
          <button class="btn-close" @click="$emit('close')" title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            
            <label class="field">
              <span>Adolescente ID <span class="required">*</span></span>
              <input v-model="adolescenteId" type="number" min="1" placeholder="Ej: 1" />
            </label>

            <label class="field">
              <span>Fecha de Atención <span class="required">*</span></span>
              <input v-model="fecha" type="date" />
            </label>

            <label class="field full-width">
              <span>Diagnóstico</span>
              <input v-model="diagnostico" type="text" placeholder="Ej: Gripe estacional, Chequeo general..." />
            </label>

            <label class="field">
              <span>¿Toma medicación? <span class="required">*</span></span>
              <div class="select-wrapper">
                <select v-model="tomaMedicacion">
                  <option value="0">No</option>
                  <option value="1">Sí</option>
                </select>
              </div>
            </label>

            <label class="field">
              <span>¿Consume sustancias? <span class="required">*</span></span>
              <div class="select-wrapper">
                <select v-model="consumeSustancia">
                  <option value="0">No</option>
                  <option value="1">Sí</option>
                </select>
              </div>
            </label>

            <label class="field full-width">
              <span>Tipo de sustancia</span>
              <input
                v-model="tipoSustancia"
                type="text"
                placeholder="Especifique si aplica..."
                :disabled="consumeSustancia !== '1'"
              />
            </label>

            <label class="field">
              <span>N° Atenciones Médicas <span class="required">*</span></span>
              <input v-model="numAtenMedica" type="number" min="0" placeholder="0" />
            </label>

            <label class="field">
              <span>¿Tiene Discapacidad? <span class="required">*</span></span>
              <div class="select-wrapper">
                <select v-model="discapacidad">
                  <option value="0">No</option>
                  <option value="1">Sí</option>
                </select>
              </div>
            </label>

            <label class="field full-width">
              <span>Observaciones</span>
              <textarea v-model="observacion" rows="3" placeholder="Detalles adicionales sobre el estado de salud..."></textarea>
            </label>

          </div>
        </div>

        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">
            Cancelar
          </button>
          <button class="btn-primary" :disabled="saving || !canSave" @click="onSave">
            <span v-if="saving">Guardando...</span>
            <span v-else>Guardar</span>
          </button>
        </div>

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

const adolescenteId = ref("");
const fecha = ref("");
const diagnostico = ref("");
const tomaMedicacion = ref("0");
const consumeSustancia = ref("0");
const tipoSustancia = ref("");
const numAtenMedica = ref("0");
const discapacidad = ref("0");
const observacion = ref("");

watch(
  () => props.initialData,
  (val) => {
    adolescenteId.value = val?.adolescenteId != null ? String(val.adolescenteId) : "";
    fecha.value = val?.fecha ? String(val.fecha).slice(0, 10) : "";
    diagnostico.value = val?.diagnostico ?? "";
    tomaMedicacion.value = val?.tomaMedicacion === "1" ? "1" : "0";
    consumeSustancia.value = val?.consumeSustancia === "1" ? "1" : "0";
    tipoSustancia.value = val?.tipoSustancia ?? "";
    numAtenMedica.value = val?.numAtenMedica != null ? String(val.numAtenMedica) : "0";
    discapacidad.value = val?.discapacidad === "1" ? "1" : "0";
    observacion.value = val?.observacion ?? "";
  },
  { immediate: true }
);

watch(
  consumeSustancia,
  (v) => {
    if (v !== "1") tipoSustancia.value = "";
  }
);

const canSave = computed(() => {
  const aId = Number(adolescenteId.value);
  if (!aId || Number.isNaN(aId)) return false;
  if (!fecha.value) return false;
  const n = Number(numAtenMedica.value);
  if (Number.isNaN(n) || n < 0) return false;
  return true;
});

const onSave = () => {
  emit("save", {
    adolescenteId: Number(adolescenteId.value),
    fecha: fecha.value,
    diagnostico: diagnostico.value.trim(),
    tomaMedicacion: tomaMedicacion.value === "1" ? "1" : "0",
    consumeSustancia: consumeSustancia.value === "1" ? "1" : "0",
    tipoSustancia: tipoSustancia.value.trim(),
    numAtenMedica: Number(numAtenMedica.value),
    discapacidad: discapacidad.value === "1" ? "1" : "0",
    observacion: observacion.value.trim(),
  });
};
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

/* --- Transitions --- */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .modal,
.modal-fade-leave-active .modal {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-fade-enter-from .modal {
  transform: scale(0.95) translateY(10px);
}
.modal-fade-leave-to .modal {
  transform: scale(0.98) translateY(10px);
}

/* --- Layout --- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex; /* Flex para centrar */
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 60;
}

.modal {
  width: min(720px, 96vw); /* Un poco más ancho por las 2 columnas */
  background: white;
  border-radius: 20px;
  box-shadow: 
    0 20px 25px -5px rgba(15, 23, 42, 0.1), 
    0 8px 10px -6px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* Para evitar que se salga en pantallas bajas */
}

/* --- Header --- */
.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.btn-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-top: -8px;
  margin-right: -8px;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #ef4444;
}

/* --- Body & Grid --- */
.modal-body {
  padding: 24px;
  overflow-y: auto; /* Scroll si es necesario en pantallas pequeñas */
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 Columnas */
  gap: 16px; /* Espaciado cómodo */
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field.full-width {
  grid-column: 1 / -1; /* Ocupa todo el ancho */
}

.field span {
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  margin-left: 2px;
}

.required {
  color: #ef4444;
}

/* Estilos compartidos inputs/selects/textareas */
.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.95rem;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s ease;
  font-family: inherit;
}

.field select {
  cursor: pointer;
  appearance: none; /* Quitamos estilo por defecto para personalizar si quisieramos más */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.field textarea {
  min-height: 80px;
  resize: vertical;
  line-height: 1.5;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  background: #fff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  position: relative;
  z-index: 2;
}

.field input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #f1f5f9;
}

/* --- Footer --- */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px 24px;
  background: transparent;
  flex-shrink: 0;
}

.actions button {
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.btn-ghost {
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
}

.btn-ghost:hover {
  background: #f1f5f9;
  color: #334155;
}

.btn-primary {
  border: none;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.2);
}

/* --- Responsive --- */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr; /* Una columna en móviles */
    gap: 12px;
  }
  
  .modal-body {
    padding: 16px;
  }
}
</style>