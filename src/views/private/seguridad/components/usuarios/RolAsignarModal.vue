<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>Asignar Roles</h3>
            <p class="subtitle">Usuario: {{ user?.nombre }} {{ user?.apellido }}</p>
          </div>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="spinner"></div>
          <div v-else class="roles-grid">
            <label 
              v-for="perfil in availableRoles" 
              :key="perfil.id" 
              class="role-card" 
              :class="{ active: selectedRoles.includes(perfil.id) }"
            >
              <input type="checkbox" :value="perfil.id" v-model="selectedRoles" class="hidden-check">
              <div class="role-content">
                <strong>{{ perfil.nombre }}</strong>
                <span class="desc">{{ perfil.descripcion }}</span>
              </div>
              <div class="check-icon" v-if="selectedRoles.includes(perfil.id)">✓</div>
            </label>
          </div>
        </div>
        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
          <button class="btn-primary" @click="$emit('save', {userId: user.id, roleIds: selectedRoles})" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getPerfiles } from "@/service/users-roles.service.js";
const props = defineProps(['open', 'user', 'saving']);
const availableRoles = ref([]);
const selectedRoles = ref([]);
const loading = ref(false);

watch(() => props.open, async (val) => {
  if (val) {
    loading.value = true;
    selectedRoles.value = [];
    try {
      const res = await getPerfiles({ size: 100 });
      availableRoles.value = res.data.data || [];
    } finally { loading.value = false; }
  }
});
</script>

<style scoped>
/* Reutiliza estilos del modal anterior + estilos específicos para roles */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 60; }
.modal { width: 500px; background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1); display: flex; flex-direction: column; max-height: 80vh; }
.modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }
.btn-close { background: transparent; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 24px; overflow-y: auto; }
.roles-grid { display: flex; flex-direction: column; gap: 10px; }
.role-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #f8fafc; }
.role-card:hover { border-color: #cbd5e1; background: white; }
.role-card.active { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
.hidden-check { display: none; }
.role-content { display: flex; flex-direction: column; }
.role-content strong { color: #0f172a; font-size: 0.95rem; }
.role-content .desc { color: #64748b; font-size: 0.8rem; }
.check-icon { color: #2563eb; font-weight: bold; }
.actions { padding: 24px; background: #f8fafc; display: flex; justify-content: flex-end; gap: 12px; border-radius: 0 0 20px 20px; }
.btn-ghost { border: 1px solid transparent; background: transparent; color: #64748b; padding: 10px 20px; cursor: pointer; font-weight: 600; border-radius: 12px; }
.btn-primary { border: none; color: white; background: #2563eb; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; }
.spinner { margin: 20px auto; width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>