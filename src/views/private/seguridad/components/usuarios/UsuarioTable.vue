<template>
  <div class="table-wrap">
    <table class="custom-table">
      <thead>
        <tr>
          <th>Identidad</th>
          <th>Documento</th>
          <th>Contacto</th>
          <th>Estado</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in items" :key="u.id">
          <td>
            <div class="user-info">
              <div class="avatar">{{ getInitials(u) }}</div>
              <div>
                <div class="cell-main">{{ safeText(u && u.nombre) }} {{ safeText(u && u.apellido) }}</div>
                <div class="cell-sub">Registrado: {{ formatDate(u && u.createdAt) }}</div>
              </div>
            </div>
          </td>

          <td>
            <span class="id-badge">{{ (u && (u.cedula ?? u.id)) ?? '—' }}</span>
          </td>

          <td>
            <div class="cell-main">{{ safeText(u && u.correo) }}</div>
          </td>

          <td>
            <span class="status-pill" :class="safeLower(u && u.estado)">{{ safeText(u && u.estado, '—') }}</span>
          </td>

          <td class="actions text-right">
            <button class="btn-action" title="Asignar Perfiles" @click="$emit('assign', u)">
              <span class="icon">🔑</span>
              <span>Perfiles</span>
            </button>
          </td>
        </tr>

        <tr v-if="items.length === 0">
          <td colspan="5" class="empty-row">
            <div class="empty-content">
              <span>🔍</span>
              <p>No se encontraron usuarios.</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps(['items']);
defineEmits(['assign']);

const safeText = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  const s = String(val);
  return s.length ? s : fallback;
};

const safeLower = (val) => safeText(val, '').toLowerCase();

const getInitials = (u) => {
  const n = safeText(u && u.nombre, '?').trim();
  const a = safeText(u && u.apellido, '?').trim();
  const i1 = (n[0] || '?').toUpperCase();
  const i2 = (a[0] || '?').toUpperCase();
  return `${i1}${i2}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};
</script>

<style scoped>
.table-wrap { width: 100%; overflow-x: auto; border-radius: 16px; border: 1px solid #e2e8f0; }
.custom-table { width: 100%; min-width: 900px; border-collapse: separate; border-spacing: 0; background: white; }
.custom-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; background: #f8fafc; padding: 16px; border-bottom: 1px solid #e2e8f0; font-weight: 800; }
.custom-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.custom-table tr:last-child td { border-bottom: none; }
.user-info { display: flex; align-items: center; gap: 12px; }
.avatar { width: 36px; height: 36px; background: #e0e7ff; color: #4338ca; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
.cell-main { font-weight: 600; color: #0f172a; font-size: 0.95rem; }
.cell-sub { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }
.id-badge { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: 600; }
.status-pill { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; }
.status-pill.activo { background: #dcfce7; color: #166534; }
.status-pill.inactivo { background: #fee2e2; color: #991b1b; }
.btn-action { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #e2e8f0; background: white; padding: 8px 14px; border-radius: 10px; cursor: pointer; font-weight: 600; color: #334155; transition: all 0.2s; }
.btn-action:hover { background: #f8fafc; border-color: #cbd5e1; color: #2563eb; transform: translateY(-1px); }
.text-right { text-align: right; }
.empty-row { padding: 80px 0; text-align: center; color: #94a3b8; }
.empty-content span { font-size: 2rem; display: block; margin-bottom: 10px; }
</style>
