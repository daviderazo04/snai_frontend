<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nuevo Traslado" : "Editar Traslado" }}</h3>
            <p class="subtitle">Complete la información del traslado</p>
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
                :key="`search-${mode}-${adolescenteId}`"
                v-model="adolescenteId"
                :disabled="mode === 'edit'"
                :hide-controls-when-disabled="mode === 'edit'"
                :label="''"
                :fetch-by-id="true"
                placeholder="Buscar por nombre o cédula..."
              />
            </label>

            <div class="field full-width">
              <span>CAI destino <span class="required">*</span></span>
              <CaiAutocomplete 
                v-model="caiId"
                placeholder="Escriba para buscar el centro de destino..."
              />
            </div>

            <label class="field">
              <span>Fecha <span class="required">*</span></span>
              <input v-model="fecha" type="date" />
            </label>

            <label class="field full-width">
              <span>Observaciones</span>
              <textarea v-model="observaciones" rows="3" placeholder="Detalle del traslado..."></textarea>
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
import CaiAutocomplete from "@/components/CAIs/CaiAutocomplete.vue"; // Importar componente

const props = defineProps({
  open: Boolean,
  mode: String,
  initialData: Object,
  saving: Boolean,
});

const emit = defineEmits(["close", "save"]);

const adolescenteId = ref(null);
const caiId = ref(null);
const fecha = ref("");
const observaciones = ref("");
const loadingData = ref(false);

const resetForm = () => {
  adolescenteId.value = null;
  caiId.value = null;
  fecha.value = new Date().toISOString().slice(0, 10);
  observaciones.value = "";
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      resetForm();
      return;
    }

    loadingData.value = true;

    if (props.mode === 'edit' && props.initialData) {
      const data = props.initialData;
      const adolId = data.adolescenteId ?? data.adolescente?.id ?? data.adolecente?.id;
      const cId = data.caiId ?? data.cai?.id;

      adolescenteId.value = adolId ? Number(adolId) : null;
      caiId.value = cId ? Number(cId) : null;
      fecha.value = data.fecha ? String(data.fecha).slice(0, 10) : "";
      observaciones.value = data.observaciones ?? "";
    } else {
      resetForm();
    }
    
    loadingData.value = false;
  },
  { immediate: true }
);

const canSave = computed(() => {
  return adolescenteId.value && caiId.value && fecha.value;
});

const onSave = () => {
  const payload = {
    caiId: Number(caiId.value),
    fecha: fecha.value,
    observaciones: String(observaciones.value || "").trim(),
  };

  if (props.mode === "create") {
    payload.adolescenteId = Number(adolescenteId.value);
    emit("save", payload);
  } else {
    emit("save", payload, props.initialData?.id);
  }
};
</script>

<style scoped>
/* Tu estilo se mantiene igual, está muy bien diseñado */
*, *::before, *::after { box-sizing: border-box; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; padding: 16px; z-index: 60; }
.modal { width: min(720px, 96vw); background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 24px 24px 0 24px; display: flex; justify-content: space-between; align-items: flex-start; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }
.btn-close { background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 50%; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field.full-width { grid-column: 1 / -1; }
.field span { font-size: 0.8rem; font-weight: 600; color: #334155; }
.required { color: #ef4444; }
.field input, .field select, .field textarea { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-size: 0.95rem; color: #0f172a; background: #f8fafc; }
.field select { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; }
.field textarea { min-height: 80px; resize: vertical; }
.actions { display: flex; justify-content: flex-end; gap: 12px; padding: 24px; }
.btn-primary { border: none; color: white; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); padding: 10px 20px; border-radius: 12px; font-weight: 600; }
.btn-ghost { border: 1px solid transparent; background: transparent; color: #64748b; padding: 10px 20px; border-radius: 12px; }
</style>