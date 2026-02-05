<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal large">
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === 'create' ? 'Nuevo Perfil' : 'Editar Perfil' }}</h3>
            <p class="subtitle">Configura los roles y sus niveles de acceso</p>
          </div>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body flex-col">
          <div class="form-row">
            <label class="field">
              <span>Nombre <span class="required">*</span></span>
              <input v-model="form.nombre" type="text" placeholder="Ej: Supervisor de Ventas" />
            </label>
            <label class="field">
              <span>Descripción</span>
              <input v-model="form.descripcion" type="text" placeholder="Descripción del rol..." />
            </label>
          </div>

          <div class="perm-controls">
            <div class="perm-header-text">
              <h4>Matriz de Permisos</h4>
              <span v-if="loadingEndpoints" class="loading-tag">Cargando recursos...</span>
            </div>
            
            <div class="search-wrapper">
              <input 
                v-model="searchPermiso" 
                type="text" 
                class="search-perm" 
                placeholder="Buscar recurso (ej: /usuarios, reportes)..." 
              />
            </div>
          </div>

          <div class="perm-section">
            <div class="perm-table-wrap">
              <table class="perm-table">
                <thead>
                  <tr>
                    <th class="col-resource">Recurso / Endpoint</th>
                    
                    <th class="center col-action">
                      <div class="th-content">
                        <span>Ver</span>
                        <div class="bulk-actions">
                          <button type="button" @click="toggleAll('VIEW', true)">Todos</button>
                          <span class="divider">|</span>
                          <button type="button" @click="toggleAll('VIEW', false)">Ninguno</button>
                        </div>
                      </div>
                    </th>

                    <th class="center col-action">
                      <div class="th-content">
                        <span>Editar</span>
                        <div class="bulk-actions">
                          <button type="button" @click="toggleAll('EDIT', true)">Todos</button>
                          <span class="divider">|</span>
                          <button type="button" @click="toggleAll('EDIT', false)">Ninguno</button>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in filteredPermissions" :key="p.endpoint">
                    <td>
                      <div class="ep-name">{{ p.endpoint }}</div>
                      <div class="ep-desc">{{ p.descripcion }}</div>
                    </td>
                    <td class="center">
                      <label class="switch">
                        <input type="checkbox" v-model="p.VIEW">
                        <span class="slider"></span>
                      </label>
                    </td>
                    <td class="center">
                      <label class="switch">
                        <input type="checkbox" v-model="p.EDIT">
                        <span class="slider"></span>
                      </label>
                    </td>
                  </tr>
                  <tr v-if="filteredPermissions.length === 0">
                    <td colspan="3" class="empty-search">
                      No se encontraron permisos que coincidan con "{{ searchPermiso }}"
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
          <button class="btn-primary" :disabled="saving || !form.nombre" @click="save">
            {{ saving ? 'Guardando...' : 'Guardar Perfil' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue';
// IMPORTANTE: Asegúrate de importar 'getPermisosPorPerfil'
import { getSystemEndpoints, getPermisosPorPerfil } from '../../../../../service/users-roles.service';

const props = defineProps(['open', 'mode', 'initialData', 'saving']);
const emit = defineEmits(['close', 'save']);

const form = reactive({ nombre: '', descripcion: '' });
const permissions = ref([]);
const loadingEndpoints = ref(false);
const searchPermiso = ref('');

// Filtro de búsqueda
const filteredPermissions = computed(() => {
  if (!searchPermiso.value) return permissions.value;
  const term = searchPermiso.value.toLowerCase();
  return permissions.value.filter(p => 
    p.endpoint.toLowerCase().includes(term) || 
    (p.descripcion && p.descripcion.toLowerCase().includes(term))
  );
});

// Marcar/Desmarcar todos
const toggleAll = (field, value) => {
  filteredPermissions.value.forEach(p => {
    p[field] = value;
  });
};

watch(() => props.open, async (val) => {
  if (val) {
    // 1. Resetear formulario
    form.nombre = props.initialData?.nombre || '';
    form.descripcion = props.initialData?.descripcion || '';
    searchPermiso.value = ''; 
    permissions.value = [];
    loadingEndpoints.value = true;
    
    try {
      // 2. Obtener lista base de endpoints del sistema
      const res = await getSystemEndpoints();
      const allEndpoints = res.data || [];

      // Crear estructura temporal (todo en false)
      const tempPermissions = allEndpoints.map(ep => ({ 
        endpoint: ep.endpoint, 
        descripcion: ep.descripcion, 
        VIEW: false, 
        EDIT: false 
      }));

      // 3. SI ES EDICIÓN: Cargar permisos reales desde BD y fusionar
      if (props.mode === 'edit' && props.initialData?.id) {
        try {
          const resPermisos = await getPermisosPorPerfil(props.initialData.id);
          const permisosActivos = resPermisos.data || [];

          // Recorrer los permisos activos y prender los switches correspondientes
          permisosActivos.forEach(activo => {
            const match = tempPermissions.find(p => p.endpoint === activo.endpoint);
            if (match) {
              match.VIEW = activo.VIEW;
              match.EDIT = activo.EDIT;
            }
          });
        } catch (err) {
          console.error("Error al cargar permisos del perfil:", err);
        }
      }

      permissions.value = tempPermissions;

    } catch (e) {
      console.error("Error cargando endpoints:", e);
    } finally { 
      loadingEndpoints.value = false; 
    }
  }
});

const save = () => {
  const payload = { nombre: form.nombre, descripcion: form.descripcion };
  const perms = permissions.value.map(p => ({ endpoint: p.endpoint, VIEW: p.VIEW, EDIT: p.EDIT }));
  
  if(props.mode === 'create') payload.permisos = perms;
  else payload.permisosEditados = perms;
  
  emit('save', payload);
};
</script>

<style scoped>
/* Layout Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 60; }
.modal { width: 800px; max-width: 96vw; background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1); display: flex; flex-direction: column; max-height: 85vh; }

.modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }
.btn-close { background: transparent; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; padding: 4px; transition: color 0.2s; }
.btn-close:hover { color: #ef4444; }

.modal-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }

/* Info Básica */
.form-row { display: flex; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.field span { font-size: 0.85rem; font-weight: 600; color: #334155; margin-left: 2px; }
.required { color: #ef4444; }
.field input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; background: #f8fafc; font-size: 0.95rem; color: #0f172a; transition: all 0.2s; }
.field input:focus { background: white; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

/* Controles de Permisos */
.perm-controls { display: flex; flex-direction: column; gap: 12px; }
.perm-header-text { display: flex; align-items: center; gap: 12px; }
.perm-header-text h4 { margin: 0; font-size: 0.95rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
.loading-tag { font-size: 0.75rem; color: #3b82f6; background: #eff6ff; padding: 2px 8px; border-radius: 12px; }

/* Buscador */
.search-wrapper { position: relative; }
.search-perm { 
  width: 100%; 
  padding: 10px 14px 10px 36px;
  border-radius: 10px; 
  border: 1px solid #e2e8f0; 
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10px center;
  background-size: 18px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.search-perm:focus { border-color: #3b82f6; }

/* Tabla */
.perm-section { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; flex: 1; min-height: 250px; }
.perm-table-wrap { overflow-y: auto; flex: 1; }
.perm-table { width: 100%; border-collapse: collapse; }

.perm-table th { position: sticky; top: 0; background: #f8fafc; z-index: 10; padding: 10px 16px; text-align: left; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
.th-content { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.th-content span { font-weight: 700; text-transform: uppercase; }

.bulk-actions { display: flex; gap: 4px; align-items: center; }
.bulk-actions button { border: none; background: none; cursor: pointer; font-size: 0.7rem; color: #3b82f6; padding: 0; font-weight: 600; }
.bulk-actions button:hover { text-decoration: underline; color: #1d4ed8; }
.divider { font-size: 0.7rem; color: #cbd5e1; }

.perm-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.ep-name { font-family: monospace; font-size: 0.85rem; color: #3b82f6; font-weight: 600; margin-bottom: 2px; }
.ep-desc { font-size: 0.75rem; color: #94a3b8; }
.center { text-align: center; }
.col-action { width: 120px; }
.empty-search { text-align: center; padding: 30px; color: #94a3b8; font-style: italic; font-size: 0.9rem; }

/* Switch */
.switch { position: relative; display: inline-block; width: 40px; height: 22px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
input:checked + .slider { background-color: #2563eb; }
input:checked + .slider:before { transform: translateX(18px); }

/* Footer */
.actions { display: flex; justify-content: flex-end; gap: 12px; padding: 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; border-radius: 0 0 20px 20px; margin-top: auto; }
.btn-primary { border: none; color: white; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); padding: 10px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; transition: transform 0.1s; }
.btn-primary:active { transform: translateY(1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { border: 1px solid #e2e8f0; background: white; color: #64748b; padding: 10px 20px; cursor: pointer; font-weight: 600; border-radius: 12px; transition: background 0.2s; }
.btn-ghost:hover { background: #f1f5f9; color: #334155; }
</style>