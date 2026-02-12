<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal large">
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === 'create' ? 'Crear Nuevo Perfil' : 'Configurar Permisos' }}</h3>
            <p class="subtitle">Define los accesos de lectura y escritura por cada recurso</p>
          </div>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body flex-col">
          <div class="form-row">
            <label class="field">
              <span>Nombre del Perfil <span class="required">*</span></span>
              <input v-model="form.nombre" type="text" placeholder="Ej: Auditor Externo" />
            </label>

            <label class="field">
              <span>
                Descripción Funcional
                <span v-if="mode === 'create'" class="required">*</span>
              </span>
              <input v-model="form.descripcion" type="text" placeholder="Responsabilidades de este rol..." />
            </label>
          </div>

          <div class="perm-controls">
            <div class="perm-header-text">
              <h4>Matriz de Permisos Granulares</h4>
              <span v-if="loadingEndpoints" class="loading-tag">Sincronizando recursos...</span>
            </div>
            
            <div class="search-wrapper">
              <input 
                v-model="searchPermiso" 
                type="text" 
                class="search-perm" 
                placeholder="Filtrar recursos por nombre o ruta..." 
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
                        <span>Lectura (VIEW)</span>
                        <div class="bulk-actions">
                          <button type="button" @click="toggleAll('VIEW', true)">Todos</button>
                          <span class="divider">|</span>
                          <button type="button" @click="toggleAll('VIEW', false)">Ninguno</button>
                        </div>
                      </div>
                    </th>
                    <th class="center col-action">
                      <div class="th-content">
                        <span>Escritura (EDIT)</span>
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
                        <input type="checkbox" v-model="p.VIEW" @change="handleToggle(p, 'VIEW')" />
                        <span class="slider"></span>
                      </label>
                    </td>
                    <td class="center">
                      <label class="switch">
                        <input type="checkbox" v-model="p.EDIT" @change="handleToggle(p, 'EDIT')" />
                        <span class="slider"></span>
                      </label>
                    </td>
                  </tr>

                  <tr v-if="filteredPermissions.length === 0">
                    <td colspan="3" class="empty-search">
                      No se encontraron recursos registrados.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
          <button class="btn-primary" :disabled="isSaveDisabled" @click="save">
            {{ saving ? 'Guardando cambios...' : 'Guardar Configuración' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue';
import { getSystemEndpoints, getDetallePerfil } from '@/service/users-roles.service.js';

const props = defineProps(['open', 'mode', 'initialData', 'saving']);
const emit = defineEmits(['close', 'save']);

const form = reactive({ nombre: '', descripcion: '' });
const permissions = ref([]);
const loadingEndpoints = ref(false);
const searchPermiso = ref('');

const filteredPermissions = computed(() => {
  if (!searchPermiso.value) return permissions.value;
  const term = searchPermiso.value.toLowerCase();
  return permissions.value.filter(p =>
    p.endpoint.toLowerCase().includes(term) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(term))
  );
});

const isSaveDisabled = computed(() => {
  const nombreOk = !!String(form.nombre || '').trim();
  const descOk = props.mode === 'create' ? !!String(form.descripcion || '').trim() : true;
  return !!props.saving || loadingEndpoints.value || !nombreOk || !descOk;
});

const toggleAll = (field, value) => {
  filteredPermissions.value.forEach(p => {
    p[field] = value;
    if (field === "EDIT" && value) {
      p.VIEW = true; // EDIT siempre implica VIEW
    }
    if (field === "VIEW" && !value) {
      p.EDIT = false; // sin VIEW no puede haber EDIT
    }
  });
};

const handleToggle = (perm, field) => {
  if (field === "EDIT" && perm.EDIT) {
    perm.VIEW = true;
  }
  if (field === "VIEW" && !perm.VIEW) {
    perm.EDIT = false;
  }
};

// Normaliza respuesta de endpoints (backend devuelve array directo)
const normalizeEndpoints = (res) => {
  const body = res?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

// ✅ getDetallePerfil devuelve ResultWithData: { success, message, data: PerfilFlatResponseDto }
const normalizeDetallePerfil = (res) => {
  const body = res?.data;
  const detalle = body?.data || null;
  const permisos = detalle?.permisos || [];
  return { detalle, permisos };
};

const buildMatrix = async () => {
  form.nombre = props.initialData?.nombre || '';
  form.descripcion = props.initialData?.descripcion || '';
  searchPermiso.value = '';
  permissions.value = [];
  loadingEndpoints.value = true;

  try {
    // 1) catálogo de endpoints (array)
    const res = await getSystemEndpoints();
    const allEndpoints = normalizeEndpoints(res);

    const tempPermissions = allEndpoints.map(ep => ({
      endpoint: ep.endpoint,
      descripcion: ep.descripcion,
      VIEW: false,
      EDIT: false,
    }));

    // 2) si edit, traer permisos del perfil
    if (props.mode === 'edit' && props.initialData?.id) {
      const resDetalle = await getDetallePerfil(props.initialData.id);

      const { permisos } = normalizeDetallePerfil(resDetalle);

      permisos.forEach(activo => {
        const match = tempPermissions.find(p => p.endpoint === activo.endpoint);
        if (match) {
          match.VIEW = !!activo.VIEW;
          match.EDIT = !!activo.EDIT;
          if (match.EDIT && !match.VIEW) match.VIEW = true; // Garantiza VIEW si viene EDIT sin VIEW
        }
      });
    }

    permissions.value = tempPermissions;
  } catch (e) {
    console.error("Error al sincronizar matriz:", e);
  } finally {
    loadingEndpoints.value = false;
  }
};

// ✅ CLAVE: immediate, porque el modal se monta con open=true (v-if)
watch(
  () => [props.open, props.mode, props.initialData?.id],
  ([isOpen]) => {
    if (isOpen) buildMatrix();
  },
  { immediate: true }
);

const save = () => {
  const payload = {
    nombre: String(form.nombre || '').trim(),
    descripcion: String(form.descripcion || '').trim(),
    [props.mode === 'create' ? 'permisos' : 'permisosEditados']: permissions.value.map(p => ({
      endpoint: p.endpoint,
      VIEW: !!p.VIEW,
      EDIT: !!p.EDIT,
    })),
  };
  emit('save', payload);
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal { width: 850px; max-width: 96vw; background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; }
.modal-header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
.modal-header h3 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #0f172a; }
.subtitle { margin: 4px 0 0; font-size: 0.9rem; color: #64748b; }
.btn-close { background: transparent; border: none; font-size: 1.8rem; color: #94a3b8; cursor: pointer; line-height: 1; }
.modal-body { padding: 32px; overflow-y: auto; display: flex; flex-direction: column; gap: 28px; }
.form-row { display: flex; gap: 24px; }
.field { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.field span { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; }
.required { color: #ef4444; }
.field input { padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 1rem; transition: all 0.2s; }
.field input:focus { background: white; border-color: #2563eb; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
.perm-controls { display: flex; flex-direction: column; gap: 16px; }
.perm-header-text { display: flex; align-items: center; gap: 12px; }
.perm-header-text h4 { margin: 0; font-size: 0.9rem; font-weight: 800; color: #1e293b; text-transform: uppercase; }
.loading-tag { font-size: 0.7rem; color: #2563eb; background: #eff6ff; padding: 4px 12px; border-radius: 20px; font-weight: 600; }
.search-perm { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 0.95rem; }
.perm-section { border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
.perm-table-wrap { max-height: 400px; overflow-y: auto; }
.perm-table { width: 100%; border-collapse: collapse; }
.perm-table th { position: sticky; top: 0; background: #f8fafc; padding: 12px 20px; text-align: left; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #e2e8f0; z-index: 1; }
.th-content { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.bulk-actions { display: flex; gap: 6px; font-size: 0.7rem; }
.bulk-actions button { border: none; background: none; color: #2563eb; cursor: pointer; font-weight: 700; }
.perm-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
.ep-name { font-family: monospace; font-size: 0.9rem; color: #2563eb; font-weight: 700; }
.ep-desc { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
.center { text-align: center; }
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #e2e8f0; transition: .3s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; transition: .3s; border-radius: 50%; }
input:checked + .slider { background: #2563eb; }
input:checked + .slider:before { transform: translateX(20px); }
.actions { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 16px; }
.btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 12px 28px; border-radius: 12px; font-weight: 700; cursor: pointer; }
</style>
