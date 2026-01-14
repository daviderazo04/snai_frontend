<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nueva Ocupación" : "Editar Ocupación" }}</h3>
            <p class="subtitle">Registre los talleres o actividades del adolescente</p>
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
            <div v-if="loadingCatalog" class="loading-state">
              <div class="spinner"></div>
              <span>Cargando datos...</span>
            </div>

            <div v-else class="form-grid">
              
              <label class="field full-width">
                <span>Adolescente <span class="required">*</span></span>
                <div class="select-wrapper">
                  <select v-model.number="form.adolescenteId" :disabled="mode === 'edit'" required>
                    <option :value="null" disabled>Seleccione un adolescente...</option>
                    <option v-for="item in adolescentesList" :key="item.id" :value="item.id">
                      {{ item.nombre }} {{ item.apellido }} ({{ item.cedula }})
                    </option>
                  </select>
                </div>
                <small v-if="mode === 'edit' && form.adolescenteId" class="helper-text">
                  Editando registros de: ID {{ form.adolescenteId }}
                </small>
              </label>

              <label class="field full-width">
                <span>Nombre del Taller / Actividad <span class="required">*</span></span>
                <input 
                  v-model="form.taller" 
                  type="text" 
                  placeholder="Ej: Carpintería, Panadería..." 
                  required
                />
              </label>

              <label class="field">
                <span>Fecha <span class="required">*</span></span>
                <input v-model="form.fecha" type="date" required />
              </label>

              <label class="field">
                <span>N° Participaciones</span>
                <input v-model.number="form.participacion" type="number" min="0" placeholder="0" />
              </label>

              <label class="field full-width">
                <span>Instructor Encargado</span>
                <input 
                  v-model="form.instructor" 
                  type="text" 
                  placeholder="Nombre del instructor" 
                />
              </label>

              <label class="field full-width">
                <span>Observaciones</span>
                <textarea 
                  v-model="form.observacion" 
                  rows="2" 
                  placeholder="Detalles del desempeño..."
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
// IMPORTANTE: Asegúrate de importar ambas funciones
import { getAdolescentes, getAdolescenteById } from "../../../../service/adolescente.service"; 
import { createOcupacion, updateOcupacion } from "../../../../service/ocupacion.service";

const props = defineProps({
  open: Boolean,
  mode: String,
  initialData: Object,
});

const emit = defineEmits(["close", "success"]);

const form = reactive({
  adolescenteId: null,
  taller: "",
  fecha: "",
  participacion: 0,
  instructor: "",
  observacion: ""
});

const adolescentesList = ref([]);
const loadingCatalog = ref(false);
const internalSaving = ref(false);

// Helper para extraer datos
const extractData = (res) => {
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data)) return res.data;
  return [];
};

// Carga inicial de catálogo (primeros 100)
const loadAdolescentes = async () => {
  if (adolescentesList.value.length > 0) return;
  
  loadingCatalog.value = true;
  try {
    const res = await getAdolescentes({ size: 100 });
    adolescentesList.value = extractData(res);
  } catch (e) {
    console.error("Error cargando adolescentes:", e);
  } finally {
    loadingCatalog.value = false;
  }
};

// Lógica para asegurar que el adolescente a editar esté en la lista
const ensureAdolescenteLoaded = async (id) => {
  if (!id) return;
  const exists = adolescentesList.value.some(a => a.id === id);
  
  if (!exists) {
    try {
      const res = await getAdolescenteById(id);
      const adol = res.data?.data ?? res.data ?? res;
      if (adol && adol.id) {
        adolescentesList.value.push(adol);
      }
    } catch (e) {
      console.warn("No se pudo cargar el adolescente individual:", id);
    }
  }
};

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await loadAdolescentes();
      internalSaving.value = false;
      
      if (props.initialData) {
        // --- MODO EDICIÓN ---
        const d = props.initialData;
        
        // 1. Extraer ID de manera robusta (objeto anidado o propiedad plana)
        const targetId = Number(d.adolescente?.id || d.adolescenteId);
        
        // 2. Asegurar que exista en la lista del select
        if (targetId) {
          await ensureAdolescenteLoaded(targetId);
          form.adolescenteId = targetId;
        } else {
          form.adolescenteId = null;
        }

        // 3. Mapear el resto de campos
        form.taller = d.taller || "";
        form.fecha = d.fecha ? String(d.fecha).slice(0, 10) : "";
        form.participacion = d.participacion ? Number(d.participacion) : 0;
        form.instructor = d.instructor || "";
        form.observacion = d.observacion || "";
      } else {
        // --- MODO CREAR ---
        form.adolescenteId = null;
        form.taller = "";
        form.fecha = new Date().toISOString().slice(0, 10);
        form.participacion = 0;
        form.instructor = "";
        form.observacion = "";
      }
    }
  },
  { immediate: true }
);

const canSave = computed(() => {
  return form.adolescenteId && form.taller && form.taller.trim().length > 0 && form.fecha;
});

const handleSaveClick = async () => {
  if (!canSave.value) return;

  internalSaving.value = true;
  try {
    const payload = {
      ...form,
      adolescenteId: Number(form.adolescenteId),
      participacion: Number(form.participacion),
    };

    if (props.mode === 'create') {
      await createOcupacion(payload);
    } else {
      await updateOcupacion(props.initialData.id, payload);
    }

    emit("success"); 
    emit("close");

  } catch (error) {
    console.error("Error guardando ocupación:", error);
    // Podrías agregar una notificación aquí
  } finally {
    internalSaving.value = false;
  }
};
</script>

<style scoped>
/* Estilos mantenidos del original */
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
  width: min(600px, 94vw); background: white; border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8); display: flex; flex-direction: column; max-height: 90vh;
}

.modal-header { padding: 24px 24px 0 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-shrink: 0; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }

.btn-close {
  background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 50%;
  color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  margin-top: -8px; margin-right: -8px;
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
.helper-text { font-size: 0.75rem; color: #64748b; margin-top: -4px; }
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