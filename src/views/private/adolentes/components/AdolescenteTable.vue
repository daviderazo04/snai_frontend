<template>
  <div class="table-card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>CAI</th>
            <th>Ubicación</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td class="id-cell">#{{ item.id }}</td>

            <td>
              <div class="name-cell">
                <span class="name">{{ item.nombre }} {{ item.apellido }}</span>
                <span class="muted">Ingreso: {{ formatDate(item.fecha_ingr) }}</span>
              </div>
            </td>

            <td>
              <span class="cedula-badge">{{ item.cedula }}</span>
            </td>

            <td>
              <div class="cell-content">
                <strong>{{ item.cai?.nombre ?? '---' }}</strong>
              </div>
            </td>

            <td>
              <div class="cell-content">
                <span>{{ item.canton?.nombre ?? '---' }}</span>
                <span class="muted small">{{ item.nacionalidad?.nombre }}</span>
              </div>
            </td>

            <td class="text-right">
              <div class="actions">
                <button class="view" @click="$emit('view', item)">Ver</button>
                <button v-if="canEdit" class="ghost" @click="$emit('edit', item)">Editar</button>
                <button v-if="canEdit" class="danger" @click="$emit('remove', item)">Eliminar</button>
              </div>
            </td>
          </tr>

          <tr v-if="items.length === 0">
            <td colspan="6">
              <div class="empty">
                <div class="empty-icon">📂</div>
                <strong>No hay adolescentes registrados</strong>
                <span>Intenta cambiar los filtros o crea uno nuevo.</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: { type: Array, default: () => [] },
    canEdit: { type: Boolean, default: true },
  },
  emits: ["view", "edit", "remove"],
  methods: {
    formatDate(val) {
      if (!val) return "-";
      return String(val).slice(0, 10);
    },
  },
};
</script>

<style scoped>
.table-card {
  background: white; border-radius: 16px; border: 1px solid #e2e8f0;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04); overflow: hidden;
}

.table-wrap { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; min-width: 1000px; }

th, td { padding: 16px 20px; text-align: left; font-size: 0.95rem; color: #0f172a; vertical-align: middle; }

th { background: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; }

tbody tr { border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
tbody tr:hover { background: #f8fafc; }
tbody tr:last-child { border-bottom: none; }

.id-cell { color: #64748b; font-family: monospace; font-weight: 600; }

.name-cell { display: flex; flex-direction: column; gap: 4px; }
.name { font-weight: 700; color: #0f172a; }
.muted { color: #64748b; font-size: 0.8rem; }
.small { font-size: 0.75rem; }

.cedula-badge {
  background: #f1f5f9; padding: 4px 8px; border-radius: 6px;
  font-family: monospace; font-size: 0.9rem; color: #334155;
}

.cell-content { display: flex; flex-direction: column; }

.text-right { text-align: right; }
.actions { display: flex; gap: 8px; justify-content: flex-end; }

/* Botones */
button {
  border: 1px solid #e2e8f0; background: white; padding: 8px 12px; border-radius: 10px;
  cursor: pointer; font-weight: 600; color: #0f172a; font-size: 0.85rem;
  transition: all 0.2s ease;
}

.view { color: #2563eb; background: #eff6ff; border-color: #dbeafe; }
.view:hover { background: #dbeafe; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1); }

.ghost:hover { background: #f1f5f9; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }

.danger { color: #b91c1c; background: rgba(254, 242, 242, 0.5); border-color: #fecaca; }
.danger:hover { background: #fee2e2; border-color: #fca5a5; }

.empty {
  padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 8px; color: #64748b;
}
.empty-icon { font-size: 2rem; margin-bottom: 8px; opacity: 0.5; }
</style>
