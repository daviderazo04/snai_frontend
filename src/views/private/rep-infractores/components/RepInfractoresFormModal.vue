<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nuevo vínculo con representante" : "Editar vínculo con representante" }}</h3>
            <p class="subtitle">Selecciona adolescente y representante para registrar el vínculo</p>
          </div>
          <button class="btn-close" @click="$emit('close')" title="Cerrar">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field full-width">
              <span>Adolescente <span class="required">*</span></span>
              <AdolescenteSearch
                :key="`${mode}-${adolescenteId || 'nuevo'}`"
                v-model="adolescenteId"
                :fetch-by-id="true"
                :label="''"
                :initial-raw="adolescenteRaw"
                placeholder="Buscar adolescente por nombre o cédula"
                @selected="onAdolescenteSelected"
                @clear="adolescenteRaw = null"
              />
            </label>

            <label class="field full-width">
              <span>Representante <span class="required">*</span></span>
              <RepresentanteSearch
                :key="`${mode}-${representanteId || 'nuevo'}`"
                v-model="representanteId"
                :label="''"
                :initial-raw="representanteRaw"
                placeholder="Buscar representante por nombre o cédula"
                @selected="onRepresentanteSelected"
                @clear="representanteRaw = null"
              />
            </label>

            <label class="field">
              <span>Fecha Inicio <span class="required">*</span></span>
              <input v-model="fechaInicio" type="date" />
            </label>

            <label class="field">
              <span>Fecha Fin <span class="required">*</span></span>
              <input v-model="fechaFin" type="date" />
            </label>

            <p v-if="hasInvalidRange" class="error-note full-width">
              La fecha fin debe ser igual o mayor a la fecha inicio.
            </p>
          </div>
        </div>

        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
          <button class="btn-primary" :disabled="saving || !canSave" @click="onSave">
            {{ saving ? "Guardando..." : "Guardar" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import AdolescenteSearch from "@/components/adolescente/AdolescenteSearch.vue";
import RepresentanteSearch from "@/components/representante/RepresentanteSearch.vue";

const props = defineProps({
  open: Boolean,
  mode: String,
  initialData: Object,
  saving: Boolean,
});

const emit = defineEmits(["close", "save"]);

const adolescenteId = ref(null);
const representanteId = ref(null);
const fechaInicio = ref("");
const fechaFin = ref("");
const adolescenteRaw = ref(null);
const representanteRaw = ref(null);

const nowIsoDate = () => new Date().toISOString().slice(0, 10);

const resetForm = () => {
  adolescenteId.value = null;
  representanteId.value = null;
  fechaInicio.value = nowIsoDate();
  fechaFin.value = nowIsoDate();
  adolescenteRaw.value = null;
  representanteRaw.value = null;
};

const syncFromInitial = () => {
  if (!props.initialData) {
    resetForm();
    return;
  }

  const adolId = Number(props.initialData?.adolescenteId ?? props.initialData?.adolescente?.id ?? 0);
  const repId = Number(props.initialData?.representanteId ?? props.initialData?.representante?.id ?? 0);

  adolescenteId.value = adolId || null;
  representanteId.value = repId || null;
  fechaInicio.value = String(props.initialData?.fechaInicio ?? "").slice(0, 10);
  fechaFin.value = String(props.initialData?.fechaFin ?? "").slice(0, 10);
  adolescenteRaw.value = props.initialData?.adolescente ?? null;
  representanteRaw.value = props.initialData?.representante ?? null;
};

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    syncFromInitial();
  },
  { immediate: true }
);

const hasInvalidRange = computed(() => {
  if (!fechaInicio.value || !fechaFin.value) return false;
  return fechaFin.value < fechaInicio.value;
});

const canSave = computed(() => {
  return (
    Number(adolescenteId.value) > 0 &&
    Number(representanteId.value) > 0 &&
    fechaInicio.value &&
    fechaFin.value &&
    !hasInvalidRange.value
  );
});

const onAdolescenteSelected = (opt) => {
  adolescenteRaw.value = opt?.raw ?? null;
};

const onRepresentanteSelected = (opt) => {
  representanteRaw.value = opt?.raw ?? null;
};

const onSave = () => {
  emit("save", {
    adolescenteId: Number(adolescenteId.value),
    representanteId: Number(representanteId.value),
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
  });
};
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

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
  width: min(680px, 96vw);
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
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
}

.btn-close:hover {
  background: #f1f5f9;
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 14px;
  align-items: start;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field.full-width {
  grid-column: 1 / -1;
}

.field span {
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
}

.required {
  color: #ef4444;
}

.field input {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 42px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.95rem;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.field input:focus {
  background: #fff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.error-note {
  margin: 0;
  color: #b91c1c;
  font-size: 0.86rem;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
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
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 860px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
