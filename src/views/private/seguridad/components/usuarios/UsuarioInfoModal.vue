<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>Actualizar información</h3>
            <p class="subtitle">Modifique datos de contacto y perfil del usuario</p>
          </div>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field">
              <span>Cédula</span>
              <input v-model="form.cedula" type="text" disabled />
            </label>
            <label class="field">
              <span>Correo</span>
              <input v-model="form.correo" type="email" />
            </label>
            <label class="field">
              <span>Nombres</span>
              <input v-model="form.nombre" type="text" />
            </label>
            <label class="field">
              <span>Apellidos</span>
              <input v-model="form.apellido" type="text" />
            </label>
            <label class="field">
              <span>Sexo</span>
              <select v-model="form.sexo">
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
              </select>
            </label>
            <label class="field">
              <span>Teléfono</span>
              <input v-model="form.telefono" type="text" />
            </label>
            <label class="field full-width">
              <span>Dirección</span>
              <input v-model="form.direccion" type="text" />
            </label>
          </div>
        </div>

        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
          <button class="btn-primary" :disabled="saving" @click="emitSave">
            {{ saving ? 'Actualizando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  open: Boolean,
  saving: Boolean,
  user: Object,
});

const emit = defineEmits(["close", "save"]);

const form = reactive({
  cedula: "",
  correo: "",
  nombre: "",
  apellido: "",
  sexo: "MASCULINO",
  telefono: "",
  direccion: "",
});

const fillForm = () => {
  const u = props.user || {};
  form.cedula = u.cedula || "";
  form.correo = u.correo || "";
  form.nombre = u.nombre || "";
  form.apellido = u.apellido || "";
  form.sexo = u.sexo || "MASCULINO";
  form.telefono = u.telefono || "";
  form.direccion = u.direccion || "";
};

watch(
  () => props.open,
  (val) => {
    if (val) fillForm();
  },
  { immediate: true }
);

const emitSave = () => {
  emit("save", { ...form });
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.4); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 100; }
.modal { width: min(720px, 96vw); background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
.header-text h3 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #0f172a; }
.subtitle { margin: 4px 0 0; color: #64748b; font-size: 0.9rem; }
.btn-close { background: transparent; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 20px 24px; overflow-y: auto; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full-width { grid-column: 1 / -1; }
.field span { font-size: 0.8rem; font-weight: 700; color: #475569; }
.field input, .field select { padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.95rem; }
.actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.btn-ghost { border: none; background: transparent; color: #64748b; padding: 10px 18px; cursor: pointer; font-weight: 600; }
.btn-primary { border: none; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 10px 18px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
