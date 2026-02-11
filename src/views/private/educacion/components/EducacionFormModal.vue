<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nuevo registro educativo" : "Editar registro educativo" }}</h3>
            <p class="subtitle">Complete la información académica</p>
          </div>
          <button class="btn-close" @click="$emit('close')" title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="loadingData" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando datos...</span>
          </div>

          <div v-else class="form-grid">
            <label class="field full-width">
              <span>Adolescente <span class="required">*</span></span>
              <AdolescenteSearch
                :key="`${mode}-${adolescenteId || 'nuevo'}`"
                v-model="adolescenteId"
                :disabled="mode === 'edit'"
                :hide-controls-when-disabled="mode === 'edit'"
                :label="''"
                :fetch-by-id="true"
                placeholder="Buscar por nombre o cédula..."
              />
            </label>

            <label class="field">
              <span>Fecha <span class="required">*</span></span>
              <input v-model="fecha" type="date" />
            </label>

            <label class="field">
              <span>¿Estudia? <span class="required">*</span></span>
              <div class="select-wrapper">
                <select v-model="estudia">
                  <option value="1">Sí</option>
                  <option value="0">No</option>
                </select>
              </div>
            </label>

            <label class="field full-width" :class="{ muted: estudia !== '0' }">
              <span>Razón no estudia</span>
              <input
                v-model="razonNoEstudia"
                type="text"
                maxlength="255"
                placeholder="Ej: Falta de recursos o desinterés"
                :disabled="estudia !== '0'"
              />
            </label>

            <label class="field">
              <span>Nivel</span>
              <input v-model="nivel" type="text" maxlength="127" placeholder="Ej: Bachillerato" />
            </label>

            <label class="field">
              <span>Ciclo académico</span>
              <input
                v-model="cicloAcademico"
                type="text"
                maxlength="63"
                placeholder="Ej: Segundo de Bachillerato"
              />
            </label>

            <label class="field">
              <span>Carrera</span>
              <input
                v-model="carrera"
                type="text"
                maxlength="127"
                placeholder="Ej: Ciencias Físico-Matemáticas"
              />
            </label>

            <label class="field">
              <span>Institución</span>
              <input
                v-model="institucion"
                type="text"
                maxlength="127"
                placeholder="Ej: Colegio Nacional Central"
              />
            </label>

            <label class="field">
              <span>Modalidad</span>
              <input v-model="modalidad" type="text" maxlength="15" placeholder="Ej: Presencial" />
            </label>

            <label class="field">
              <span>Contacto</span>
              <input v-model="contacto" type="text" maxlength="63" placeholder="Ej: 022345678" />
            </label>

            <label class="field full-width">
              <span>Observación</span>
              <textarea
                v-model="observacion"
                rows="3"
                maxlength="255"
                placeholder="Ej: El adolescente muestra interés en matemáticas."
              ></textarea>
            </label>
          </div>
        </div>

        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
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
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";

const props = defineProps({
  open: Boolean,
  mode: String,
  initialData: Object,
  saving: Boolean,
});

const emit = defineEmits(["close", "save"]);

const adolescenteId = ref(null);
const fecha = ref("");
const estudia = ref("1");
const razonNoEstudia = ref("");
const nivel = ref("");
const cicloAcademico = ref("");
const carrera = ref("");
const institucion = ref("");
const modalidad = ref("");
const contacto = ref("");
const observacion = ref("");

const loadingData = ref(false);

const resetForm = () => {
  adolescenteId.value = null;
  fecha.value = new Date().toISOString().slice(0, 10);
  estudia.value = "1";
  razonNoEstudia.value = "";
  nivel.value = "";
  cicloAcademico.value = "";
  carrera.value = "";
  institucion.value = "";
  modalidad.value = "";
  contacto.value = "";
  observacion.value = "";
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;

    loadingData.value = true;
    try {
      if (props.initialData) {
        const val = props.initialData;
        const adolRaw = val?.adolescenteId ?? val?.adolescente?.id ?? null;

        if (adolRaw) {
          const targetId = Number(adolRaw);
          adolescenteId.value = targetId;
        } else {
          adolescenteId.value = null;
        }

        fecha.value = val?.fecha ? String(val.fecha).slice(0, 10) : "";
        estudia.value = val?.estudia === "0" ? "0" : "1";
        razonNoEstudia.value = val?.razonNoEstudia ?? "";
        nivel.value = val?.nivel ?? "";
        cicloAcademico.value = val?.cicloAcademico ?? "";
        carrera.value = val?.carrera ?? "";
        institucion.value = val?.institucion ?? "";
        modalidad.value = val?.modalidad ?? "";
        contacto.value = val?.contacto ?? "";
        observacion.value = val?.observacion ?? "";
      } else {
        resetForm();
      }
    } finally {
      loadingData.value = false;
    }
  },
  { immediate: true }
);

watch(estudia, (v) => {
  if (v !== "0") razonNoEstudia.value = "";
});

const canSave = computed(() => {
  const aId = Number(adolescenteId.value);
  if (!aId || Number.isNaN(aId)) return false;
  if (!fecha.value) return false;
  if (estudia.value !== "0" && estudia.value !== "1") return false;
  return true;
});

const onSave = () => {
  emit("save", {
    adolescenteId: Number(adolescenteId.value),
    fecha: fecha.value,
    estudia: estudia.value === "1" ? "1" : "0",
    razonNoEstudia: razonNoEstudia.value.trim(),
    nivel: nivel.value.trim(),
    cicloAcademico: cicloAcademico.value.trim(),
    carrera: carrera.value.trim(),
    institucion: institucion.value.trim(),
    modalidad: modalidad.value.trim(),
    contacto: contacto.value.trim(),
    observacion: observacion.value.trim(),
  });
};
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal, .modal-fade-leave-active .modal { transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fade-enter-from .modal { transform: scale(0.95) translateY(10px); }
.modal-fade-leave-to .modal { transform: scale(0.98) translateY(10px); }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; padding: 16px; z-index: 60; }
.modal { width: min(860px, 96vw); background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1); border: 1px solid rgba(255, 255, 255, 0.8); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 24px 24px 0 24px; display: flex; justify-content: space-between; align-items: flex-start; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }
.btn-close { background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 50%; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: all 0.2s; margin-top: -8px; margin-right: -8px; }
.btn-close:hover { background: #f1f5f9; color: #ef4444; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: #64748b; gap: 10px; }
.spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field.full-width { grid-column: 1 / -1; }
.field span { font-size: 0.8rem; font-weight: 600; color: #334155; margin-left: 2px; }
.required { color: #ef4444; }
.field input, .field select, .field textarea { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-size: 0.95rem; color: #0f172a; background: #f8fafc; transition: all 0.2s ease; font-family: inherit; }
.field select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; }
.field textarea { min-height: 90px; resize: vertical; line-height: 1.5; }
.field input:focus, .field select:focus, .field textarea:focus { background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); position: relative; z-index: 2; }
.field input:disabled, .field select:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; border-color: #f1f5f9; }
.field.muted { opacity: 0.75; }
.actions { display: flex; justify-content: flex-end; gap: 12px; padding: 0 24px 24px 24px; background: transparent; flex-shrink: 0; }
.actions button { padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.2s ease; }
.btn-ghost { border: 1px solid transparent; background: transparent; color: #64748b; }
.btn-ghost:hover { background: #f1f5f9; color: #334155; }
.btn-primary { border: none; color: white; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.btn-primary:hover:not(:disabled) { opacity: 0.95; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.2); }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; gap: 12px; } .modal-body { padding: 16px; } }
</style>
