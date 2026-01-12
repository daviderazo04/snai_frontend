<!-- src/views/private/educacion/components/EducacionFormModal.vue -->
<template>
  <div v-if="open" class="modal-backdrop">
    <div class="modal">
      <h3>{{ mode === "create" ? "Nuevo registro" : "Editar registro" }}</h3>

      <div class="grid">
        <label class="field">
          <span>Adolescente ID *</span>
          <input v-model="adolescenteId" type="number" min="1" placeholder="Ej: 1" />
        </label>

        <label class="field">
          <span>Fecha *</span>
          <input v-model="fecha" type="date" />
        </label>

        <label class="field">
          <span>¿Estudia? *</span>
          <select v-model="estudia">
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </label>

        <label class="field full" :class="{ muted: estudia !== '0' }">
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

        <label class="field full">
          <span>Observación</span>
          <textarea
            v-model="observacion"
            rows="3"
            maxlength="255"
            placeholder="Ej: El adolescente muestra interés en matemáticas."
          ></textarea>
        </label>
      </div>

      <div class="actions">
        <button @click="$emit('close')">Cancelar</button>
        <button class="btn-primary" :disabled="saving || !canSave" @click="onSave">
          Guardar
        </button>
      </div>
    </div>
  </div>
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
const estudia = ref("1");
const razonNoEstudia = ref("");
const nivel = ref("");
const cicloAcademico = ref("");
const carrera = ref("");
const institucion = ref("");
const modalidad = ref("");
const contacto = ref("");
const observacion = ref("");

watch(
  () => props.initialData,
  (val) => {
    adolescenteId.value = val?.adolescenteId != null ? String(val.adolescenteId) : "";
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
  // opcional: si no estudia, pedir razón
  // if (estudia.value === "0" && !razonNoEstudia.value.trim()) return false;
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
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 60;
}

.modal {
  width: min(900px, 96vw);
  background: white;
  border-radius: 18px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
}

.modal h3 {
  margin: 0 0 14px;
  font-size: 1.15rem;
  color: #0f172a;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

.field span {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #475569;
  font-weight: 800;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.95rem;
  background: #fff;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.field textarea {
  resize: vertical;
  min-height: 90px;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: rgba(59, 130, 246, 0.55);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
}

.field input:disabled {
  background: #f1f5f9;
  color: #64748b;
}

.field.muted {
  opacity: 0.75;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.actions button {
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  color: #0f172a;
  transition: transform 0.08s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.actions button:hover {
  background: #f8fafc;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}

.actions button:active {
  transform: translateY(1px);
}

.btn-primary {
  border: none !important;
  color: white !important;
  background: linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%) !important;
  box-shadow: 0 14px 28px rgba(29, 78, 216, 0.22);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
