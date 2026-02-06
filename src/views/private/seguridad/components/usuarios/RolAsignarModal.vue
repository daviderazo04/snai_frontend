<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>Gestionar Roles</h3>
            <div v-if="user" class="user-subtitle">
              <span class="u-name">{{ user.nombre }} {{ user.apellido }}</span>
              <span class="u-cedula">{{ user.correo }}</span>
            </div>
          </div>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <div v-if="loading" class="spinner-container">
            <div class="spinner"></div>
            <span>Sincronizando catálogo de perfiles...</span>
          </div>

          <div v-else class="roles-container">
            <div
              v-for="perfil in availableRoles"
              :key="perfil.id"
              class="role-row"
              :class="{ 'is-active': selectedRoles.includes(perfil.id) }"
              @click="toggleRole(perfil.id)"
            >
              <div class="role-check">
                <div class="custom-checkbox" :class="{ checked: selectedRoles.includes(perfil.id) }">
                  <span v-if="selectedRoles.includes(perfil.id)">✓</span>
                </div>
              </div>

              <div class="role-info">
                <strong class="role-name">{{ perfil.nombre }}</strong>
                <span class="role-desc">{{ perfil.descripcion || 'Sin descripción' }}</span>
              </div>

              <div class="role-status">
                <span v-if="initialRoles.includes(perfil.id)" class="badge-assigned">Actual</span>
                <span v-else-if="selectedRoles.includes(perfil.id)" class="badge-new">Nuevo</span>
              </div>
            </div>

            <div v-if="availableRoles.length === 0" class="empty-state">
              <p>⚠️ No se encontraron perfiles en la base de datos.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="summary">
            <strong>{{ selectedRoles.length }}</strong> seleccionados
          </div>
          <div class="buttons">
            <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
            <button
              class="btn-primary"
              :disabled="saving || loading"
              @click="confirmSave"
            >
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getPerfiles } from '@/service/users-roles.service.js';

const props = defineProps(['open', 'user', 'saving']);
const emit = defineEmits(['close', 'save']);

const availableRoles = ref([]); // catálogo final (sistema + usuario)
const selectedRoles = ref([]);  // ids seleccionados
const initialRoles = ref([]);   // ids que ya tenía el usuario
const loading = ref(false);

const dedupeById = (arr) => {
  const map = new Map();
  (arr || []).forEach((x) => {
    if (x && x.id != null) map.set(Number(x.id), x);
  });
  return Array.from(map.values());
};

const loadRoles = async () => {
  loading.value = true;

  // 1) perfiles del usuario (desde detalle) — dedupe por id
  const userRoles = dedupeById(props.user?.perfiles || []);
  const ids = userRoles.map((p) => Number(p.id));
  selectedRoles.value = [...new Set(ids)];
  initialRoles.value = [...new Set(ids)];

  try {
    // 2) perfiles del sistema (API /perfil)
    const response = await getPerfiles({ nombre: '', page: 1, size: 500 });

    // en tu backend: { success, message, data: [ ... ] , totalPages? }
    const systemRoles = dedupeById(response.data?.data || []);

    // 3) merge sistema + usuario (por si el usuario tiene alguno que no venga en catálogo)
    const map = new Map();
    systemRoles.forEach((r) => map.set(Number(r.id), r));
    userRoles.forEach((r) => map.set(Number(r.id), r));
    availableRoles.value = Array.from(map.values());
  } catch (error) {
    console.error('Error cargando perfiles del sistema (/perfil):', error);
    // si falla, al menos mostrar los del usuario
    availableRoles.value = userRoles;
  } finally {
    loading.value = false;
  }
};

// ✅ CLAVE: immediate para que corra al montar si open ya viene true
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) loadRoles();
  },
  { immediate: true }
);

// si cambia el user mientras está abierto, vuelve a sincronizar
watch(
  () => props.user,
  () => {
    if (props.open) loadRoles();
  }
);

const toggleRole = (id) => {
  if (selectedRoles.value.includes(id)) {
    selectedRoles.value = selectedRoles.value.filter((r) => r !== id);
  } else {
    selectedRoles.value.push(id);
  }
};

const confirmSave = () => {
  const rolesToAdd = selectedRoles.value.filter((id) => !initialRoles.value.includes(id));

  if (rolesToAdd.length === 0) {
    if (selectedRoles.value.length < initialRoles.value.length) {
      alert('El sistema actual solo permite asignar nuevos roles, no eliminarlos.');
    } else {
      alert('No has seleccionado nuevos roles para asignar.');
    }
    return;
  }

  emit('save', {
    userId: props.user.id,
    roleIds: rolesToAdd,
  });
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal { width: 550px; background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; max-height: 85vh; overflow: hidden; }

.modal-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; background: #f8fafc; }
.header-text h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.user-subtitle { display: flex; flex-direction: column; font-size: 0.85rem; color: #64748b; margin-top: 4px; }
.u-name { font-weight: 600; color: #334155; }
.btn-close { background: transparent; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1; }

.modal-body { padding: 0; overflow-y: auto; background: white; }
.roles-container { display: flex; flex-direction: column; }

.role-row {
  display: flex; align-items: center; gap: 16px; padding: 14px 24px;
  border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s;
}
.role-row:hover { background: #f8fafc; }
.role-row.is-active { background: #eff6ff; }

.custom-checkbox { width: 20px; height: 20px; border: 2px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; transition: all 0.2s; }
.custom-checkbox.checked { background: #2563eb; border-color: #2563eb; }

.role-info { flex: 1; display: flex; flex-direction: column; }
.role-name { font-size: 0.95rem; color: #0f172a; }
.role-desc { font-size: 0.8rem; color: #64748b; }

.role-status { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.badge-assigned { color: #059669; background: #d1fae5; padding: 2px 8px; border-radius: 4px; }
.badge-new { color: #2563eb; background: #dbeafe; padding: 2px 8px; border-radius: 4px; }

.spinner-container { padding: 40px; text-align: center; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.spinner { width: 24px; height: 24px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s infinite linear; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { padding: 40px; text-align: center; color: #ef4444; }

.modal-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: space-between; align-items: center; }
.summary { font-size: 0.85rem; color: #64748b; }
.buttons { display: flex; gap: 12px; }
.btn-ghost { padding: 10px 16px; border: 1px solid #cbd5e1; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: #475569; }
.btn-primary { padding: 10px 24px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
