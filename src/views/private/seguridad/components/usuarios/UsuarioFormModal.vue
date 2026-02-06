<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>Registrar Nuevo Usuario</h3>
            <p class="subtitle">Complete los datos de acceso y contacto</p>
          </div>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field">
              <span>Cédula <span class="required">*</span></span>
              <input v-model="form.cedula" type="text" maxlength="10" placeholder="Ej: 1717..." />
            </label>
            <label class="field">
              <span>Correo Institucional <span class="required">*</span></span>
              <input v-model="form.correo" type="email" placeholder="usuario@snai.gob.ec" />
            </label>
            <label class="field">
              <span>Nombres <span class="required">*</span></span>
              <input v-model="form.nombre" type="text" placeholder="Juan" />
            </label>
            <label class="field">
              <span>Apellidos <span class="required">*</span></span>
              <input v-model="form.apellido" type="text" placeholder="Pérez" />
            </label>
            <label class="field">
              <span>Sexo <span class="required">*</span></span>
              <select v-model="form.sexo">
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
              </select>
            </label>
            <label class="field">
              <span>Teléfono <span class="required">*</span></span>
              <input v-model="form.telefono" type="text" placeholder="+593..." />
            </label>
            <label class="field full-width">
              <span>Dirección de Domicilio <span class="required">*</span></span>
              <input v-model="form.direccion" type="text" placeholder="Calle principal..." />
            </label>
            <label class="field full-width">
              <span>Contraseña Temporal <span class="required">*</span></span>
              <input v-model="form.password" type="password" placeholder="••••••••" />
            </label>
          </div>
        </div>

        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
          <button class="btn-primary" :disabled="saving" @click="$emit('save', { ...form })">
            {{ saving ? 'Registrando...' : 'Crear Cuenta' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps(['open', 'saving']);
defineEmits(['close', 'save']);

const form = reactive({
  cedula: '',
  correo: '',
  nombre: '',
  apellido: '',
  sexo: 'MASCULINO',
  telefono: '',
  direccion: '',
  password: '',
});

watch(
  () => props.open,
  (val) => {
    if (val) {
      Object.keys(form).forEach((k) => {
        form[k] = k === 'sexo' ? 'MASCULINO' : '';
      });
    }
  },
);
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; padding: 16px; z-index: 100; }
.modal { width: min(650px, 96vw); background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1); display: flex; flex-direction: column; max-height: 95vh; }
.modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }
.btn-close { background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
.modal-body { padding: 24px; overflow-y: auto; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field.full-width { grid-column: 1 / -1; }
.field span { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
.required { color: #ef4444; }
.field input, .field select { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; font-size: 0.95rem; color: #0f172a; background: #f8fafc; transition: all 0.2s; }
.field input:focus { background: #fff; border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
.actions { display: flex; justify-content: flex-end; gap: 12px; padding: 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; border-radius: 0 0 20px 20px; }
.btn-ghost { border: none; background: transparent; color: #64748b; padding: 10px 20px; cursor: pointer; font-weight: 600; }
.btn-primary { border: none; color: white; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
