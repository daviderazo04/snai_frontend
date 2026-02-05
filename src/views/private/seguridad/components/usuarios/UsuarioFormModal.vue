<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>Nuevo Usuario</h3>
            <p class="subtitle">Complete la información de registro</p>
          </div>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <label class="field">
              <span>Cédula <span class="required">*</span></span>
              <input v-model="form.cedula" type="text" maxlength="10" />
            </label>
            <label class="field">
              <span>Correo <span class="required">*</span></span>
              <input v-model="form.correo" type="email" />
            </label>
            <label class="field">
              <span>Nombres <span class="required">*</span></span>
              <input v-model="form.nombre" type="text" />
            </label>
            <label class="field">
              <span>Apellidos <span class="required">*</span></span>
              <input v-model="form.apellido" type="text" />
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
              <input v-model="form.telefono" type="text" />
            </label>
            <label class="field full-width">
              <span>Dirección <span class="required">*</span></span>
              <input v-model="form.direccion" type="text" />
            </label>
            <label class="field full-width">
              <span>Contraseña <span class="required">*</span></span>
              <input v-model="form.password" type="password" />
            </label>
          </div>
        </div>

        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
          <button class="btn-primary" :disabled="saving" @click="$emit('save', form)">
            {{ saving ? 'Guardando...' : 'Crear Usuario' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, watch } from 'vue';
const props = defineProps(['open', 'saving']);
const form = reactive({ cedula:'', correo:'', nombre:'', apellido:'', sexo:'MASCULINO', telefono:'', direccion:'', password:'' });
watch(() => props.open, (val) => { if(val) Object.keys(form).forEach(k => form[k] = k === 'sexo' ? 'MASCULINO' : ''); });
</script>

<style scoped>
/* Estilos exactos de EducacionFormModal.vue */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; padding: 16px; z-index: 60; }
.modal { width: min(600px, 96vw); background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1); border: 1px solid rgba(255, 255, 255, 0.8); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }
.btn-close { background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
.modal-body { padding: 24px; overflow-y: auto; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field.full-width { grid-column: 1 / -1; }
.field span { font-size: 0.8rem; font-weight: 600; color: #334155; }
.required { color: #ef4444; }
.field input, .field select { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-size: 0.95rem; color: #0f172a; background: #f8fafc; }
.field input:focus { background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
.actions { display: flex; justify-content: flex-end; gap: 12px; padding: 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; border-radius: 0 0 20px 20px; }
.btn-ghost { border: 1px solid transparent; background: transparent; color: #64748b; padding: 10px 20px; cursor: pointer; font-weight: 600; border-radius: 12px; }
.btn-primary { border: none; color: white; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>