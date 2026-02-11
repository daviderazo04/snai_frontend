<template>
  <div class="table-card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Delito</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td class="id-cell">#{{ item.id }}</td>
            
            <td>
              <span class="name">{{ item.nombre }}</span>
            </td>

            <td class="text-right">
              <div class="actions">
                <button v-if="canEdit" class="ghost" @click="$emit('edit', item)">Editar</button>
                <button v-if="canEdit" class="danger" @click="$emit('remove', item)">Eliminar</button>
              </div>
            </td>
          </tr>

          <tr v-if="!items || items.length === 0">
            <td colspan="3">
              <div class="empty">
                <div class="empty-icon">⚖️</div>
                <strong>No hay delitos registrados</strong>
                <span>Crea uno nuevo para comenzar.</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  canEdit: { type: Boolean, default: true },
});
defineEmits(["edit", "remove"]);
</script>

<style scoped>
.table-card {
  background: white; border-radius: 16px; border: 1px solid #e2e8f0;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04); overflow: hidden;
}
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 500px; }

th, td {
  padding: 16px 20px; text-align: left; font-size: 0.95rem; color: #0f172a; vertical-align: middle;
}
th {
  background: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase;
  font-size: 0.75rem; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0;
}
tbody tr { border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
tbody tr:hover { background: #f8fafc; }
tbody tr:last-child { border-bottom: none; }

.id-cell { color: #64748b; font-family: monospace; font-weight: 600; width: 80px; }
.name { font-weight: 600; color: #0f172a; }
.text-right { text-align: right; }
.actions { display: flex; gap: 8px; justify-content: flex-end; }

button {
  border: 1px solid #e2e8f0; background: white; padding: 8px 12px; border-radius: 10px;
  cursor: pointer; font-weight: 600; color: #0f172a; font-size: 0.85rem; transition: all 0.2s ease;
}
.ghost:hover { background: #f1f5f9; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }
.danger { color: #b91c1c; background: rgba(254, 242, 242, 0.5); border-color: #fecaca; }
.danger:hover { background: #fee2e2; border-color: #fca5a5; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1); }

.empty {
  padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; color: #64748b;
}
.empty-icon { font-size: 2rem; margin-bottom: 4px; opacity: 0.6; }
</style>
