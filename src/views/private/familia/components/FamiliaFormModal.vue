<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nueva Interacción Familiar" : "Editar Registro" }}</h3>
            <p class="subtitle">Registre los detalles de la visita o evento familiar</p>
          </div>
          <button class="btn-close" type="button" @click="$emit('close')" title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form class="form-content" @submit.prevent="handleSaveClick">
          
          <div class="modal-body">
            <div v-if="loadingData" class="loading-state">
              <div class="spinner"></div>
              <span>Cargando catálogos...</span>
            </div>

            <div v-else class="form-grid">
              
              <label class="field full-width">
                <span>Adolescente <span class="required">*</span></span>
                <AdolescenteSearch
                  :key="`${mode}-${form.adolescenteId || 'nuevo'}`"
                  v-model="form.adolescenteId"
                  :disabled="mode === 'edit'"
                  :hide-controls-when-disabled="mode === 'edit'"
                  :label="''"
                  :fetch-by-id="true"
                  placeholder="Buscar por nombre o cédula..."
                />
              </label>

              <label class="field">
                <span>Evento <span class="required">*</span></span>
                <div class="select-wrapper">
                  <select v-model.number="form.eventoId" required>
                    <option :value="null" disabled>Seleccione un evento...</option>
                    <option v-for="evento in eventosList" :key="evento.id" :value="evento.id">
                      {{ evento.descripcion || evento.nombre }}
                    </option>
                  </select>
                </div>
              </label>

              <label class="field">
                <span>Fecha <span class="required">*</span></span>
                <input v-model="form.fecha" type="date" required />
              </label>

              <label class="field full-width">
                <span>Detalle de la Interacción <span class="required">*</span></span>
                <textarea 
                  v-model="form.detalle" 
                  rows="3" 
                  placeholder="Descripción de la visita, reunión o contacto familiar..."
                  required
                ></textarea>
              </label>

            </div>
          </div>

          <div class="actions">
            <button class="btn-ghost" type="button" @click="$emit('close')">
              Cancelar
            </button>
            
            <button 
              class="btn-primary" 
              type="submit"
              :disabled="internalSaving || !canSave" 
            >
              <span v-if="internalSaving">Guardando...</span>
              <span v-else>Guardar</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, reactive } from "vue";
import { getEventos } from "../../../../service/evento.service"; 
import { createFamilia, updateFamilia } from "../../../../service/familia.service";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";

const props = defineProps({
  open: Boolean,
  mode: String,
  initialData: Object,
});

const emit = defineEmits(["close", "success"]);

const form = reactive({
  adolescenteId: null,
  eventoId: null,
  fecha: "",
  detalle: ""
});

const eventosList = ref([]);
const loadingData = ref(false);
const internalSaving = ref(false);

const extractData = (res) => {
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data)) return res.data;
  return [];
};

const loadCatalogs = async () => {
  if (eventosList.value.length > 0) return;
  
  loadingData.value = true;
  try {
    const resEventos = await getEventos({ size: 100 });
    eventosList.value = extractData(resEventos);
  } catch (e) {
    console.error("Error cargando catálogos:", e);
  } finally {
    loadingData.value = false;
  }
};

const resetForm = () => {
  form.adolescenteId = null;
  form.eventoId = null;
  form.fecha = new Date().toISOString().slice(0, 10);
  form.detalle = "";
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    await loadCatalogs();
    internalSaving.value = false;
    
    if (props.initialData) {
      const d = props.initialData;
      const adolId = d.adolescente?.id || d.adolescenteId;
      const evtId = d.evento?.id || d.eventoId;

      form.adolescenteId = adolId ? Number(adolId) : null;
      form.eventoId = evtId ? Number(evtId) : null;
      
      form.fecha = d.fecha ? new Date(d.fecha).toISOString().slice(0, 10) : "";
      form.detalle = d.detalle || "";
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const canSave = computed(() => {
  return form.adolescenteId && form.eventoId && form.fecha && form.detalle.trim().length > 0;
});

const handleSaveClick = async () => {
  if (!canSave.value) return;

  internalSaving.value = true;
  try {
    const payload = {
      adolescenteId: Number(form.adolescenteId),
      eventoId: Number(form.eventoId),
      fecha: form.fecha,
      detalle: form.detalle.trim()
    };

    if (props.mode === 'create') {
      await createFamilia(payload);
    } else {
      // Usamos props.initialData.id para editar
      await updateFamilia(props.initialData.id, payload);
    }

    emit("success"); 
    emit("close");

  } catch (error) {
    console.error("Error guardando familia:", error);
  } finally {
    internalSaving.value = false;
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
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 60;
}

.modal {
  width: min(600px, 94vw); 
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }

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
.btn-close:hover { background: #f1f5f9; color: #ef4444; }

.form-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }

.loading-state { 
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  padding: 40px; color: #64748b; gap: 10px;
}
.spinner {
  width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #2563eb;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field.full-width { grid-column: 1 / -1; }
.field span { font-size: 0.8rem; font-weight: 600; color: #334155; margin-left: 2px; }
.required { color: #ef4444; }

.field input, .field textarea, .field select {
  width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0;
  outline: none; font-size: 0.95rem; color: #0f172a; background: #f8fafc;
  transition: all 0.2s ease; font-family: inherit;
}

.field select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; cursor: pointer;
}

.field input:focus, .field textarea:focus, .field select:focus {
  background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); position: relative; z-index: 2;
}

.actions {
  display: flex; justify-content: flex-end; gap: 12px; padding: 0 24px 24px 24px; background: transparent; flex-shrink: 0;
}

.actions button { padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.2s ease; }
.btn-ghost { border: 1px solid transparent; background: transparent; color: #64748b; }
.btn-ghost:hover { background: #f1f5f9; color: #334155; }
.btn-primary { border: none; color: white; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.btn-primary:hover:not(:disabled) { opacity: 0.95; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.2); }

@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
