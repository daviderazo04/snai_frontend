<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nuevo representante" : "Editar representante" }}</h3>
            <p class="subtitle">Completa los datos obligatorios del representante</p>
          </div>
          <button class="btn-close" @click="$emit('close')" title="Cerrar">✕</button>
        </div>

        <div class="modal-body">
          <div v-if="loadingCatalogs" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando catálogos...</span>
          </div>

          <div v-else class="form-grid">
            <label class="field">
              <span>Nombre <span class="required">*</span></span>
              <input v-model="nombre" type="text" placeholder="Ej: Pedro" />
            </label>

            <label class="field">
              <span>Apellido <span class="required">*</span></span>
              <input v-model="apellido" type="text" placeholder="Ej: Gomez" />
            </label>

            <label class="field">
              <span>Cédula <span class="required">*</span></span>
              <input v-model="cedula" type="text" placeholder="Ej: 1714875214" />
            </label>

            <label class="field">
              <span>Nacionalidad <span class="required">*</span></span>
              <select v-model="nacionalidadId">
                <option :value="null" disabled>Seleccione...</option>
                <option
                  v-for="n in nacionalidades"
                  :key="n.id"
                  :value="n.id"
                >
                  {{ n.nombre }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>Parentesco <span class="required">*</span></span>
              <select v-model="parentescoId">
                <option :value="null" disabled>Seleccione...</option>
                <option
                  v-for="p in parentescos"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.nombre }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>Cantón <span class="required">*</span></span>
              <select v-model="cantonId">
                <option :value="null" disabled>Seleccione...</option>
                <option
                  v-for="c in cantones"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.nombre }}
                </option>
              </select>
            </label>
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
import { getCantones } from "@/service/cantones.service";
import { getNacionalidades } from "@/service/nacionalidad.service";
import { getParentescos } from "@/service/parentesco.service";

const props = defineProps({
  open: Boolean,
  mode: String,
  initialData: Object,
  saving: Boolean,
});

const emit = defineEmits(["close", "save"]);

const nombre = ref("");
const apellido = ref("");
const cedula = ref("");
const nacionalidadId = ref(null);
const parentescoId = ref(null);
const cantonId = ref(null);

const nacionalidades = ref([]);
const parentescos = ref([]);
const cantones = ref([]);
const loadingCatalogs = ref(false);

const parseCatalogList = (res) => {
  const payload = res?.data ?? res;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const mapCatalog = (row) => ({
  id: Number(row?.id ?? 0),
  nombre: row?.nombre ?? "",
});

const loadCatalogs = async () => {
  if (nacionalidades.value.length && parentescos.value.length && cantones.value.length) return;

  loadingCatalogs.value = true;
  try {
    const [nRes, pRes, cRes] = await Promise.all([
      getNacionalidades({ page: 1, size: 1000 }),
      getParentescos({ page: 1, size: 1000 }),
      getCantones({ page: 1, size: 1000 }),
    ]);

    nacionalidades.value = parseCatalogList(nRes).map(mapCatalog);
    parentescos.value = parseCatalogList(pRes).map(mapCatalog);
    cantones.value = parseCatalogList(cRes).map(mapCatalog);
  } catch (error) {
    console.error("Error cargando catálogos de representantes:", error);
  } finally {
    loadingCatalogs.value = false;
  }
};

const resetForm = () => {
  nombre.value = "";
  apellido.value = "";
  cedula.value = "";
  nacionalidadId.value = null;
  parentescoId.value = null;
  cantonId.value = null;
};

const syncFromInitial = () => {
  if (!props.initialData) {
    resetForm();
    return;
  }

  nombre.value = props.initialData?.nombre ?? "";
  apellido.value = props.initialData?.apellido ?? "";
  cedula.value = props.initialData?.cedula ?? "";
  nacionalidadId.value = Number(props.initialData?.nacionalidadId ?? props.initialData?.nacionalidad?.id ?? 0) || null;
  parentescoId.value = Number(props.initialData?.parentescoId ?? props.initialData?.parentesco?.id ?? 0) || null;
  cantonId.value = Number(props.initialData?.cantonId ?? props.initialData?.canton?.id ?? 0) || null;
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    await loadCatalogs();
    syncFromInitial();
  },
  { immediate: true }
);

const canSave = computed(() => {
  return (
    nombre.value.trim().length > 0 &&
    apellido.value.trim().length > 0 &&
    cedula.value.trim().length > 0 &&
    Number(nacionalidadId.value) > 0 &&
    Number(parentescoId.value) > 0 &&
    Number(cantonId.value) > 0
  );
});

const onSave = () => {
  emit("save", {
    nacionalidadId: Number(nacionalidadId.value),
    parentescoId: Number(parentescoId.value),
    cantonId: Number(cantonId.value),
    nombre: nombre.value.trim(),
    apellido: apellido.value.trim(),
    cedula: cedula.value.trim(),
  });
};
</script>

<style scoped>
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #64748b;
  gap: 10px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span {
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
}

.required {
  color: #ef4444;
}

.field input,
.field select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.95rem;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.field input:focus,
.field select:focus {
  background: #fff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
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

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
