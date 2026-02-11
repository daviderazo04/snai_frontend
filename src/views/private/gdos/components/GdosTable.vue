<template>
  <div class="table-card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Grupo G2</th>
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
                <button v-if="canEdit" class="ghost" type="button" @click="$emit('edit', item)">
                  Editar
                </button>
                <button v-if="canEdit" class="danger" type="button" @click="$emit('remove', item)">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="3">
              <div class="empty">
                <strong>Sin resultados</strong>
                <span>Prueba ajustar el filtro o crear un G2 nuevo.</span>
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
    items: {
      type: Array,
      default: () => [],
    },
    canEdit: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["edit", "remove"],
};
</script>

<style scoped>
.table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 520px;
}

th, td {
  padding: 14px 16px;
  text-align: left;
  font-size: 0.95rem;
  color: #0f172a;
}

th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  border-bottom: 1px solid #e2e8f0;
}

tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}

tbody tr:hover {
  background: #f8fafc;
}

.id-cell {
  color: #64748b;
  font-weight: 600;
  width: 80px;
}

.name {
  font-weight: 600;
  color: #0f172a;
}

.text-right {
  text-align: right;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Botones */
button {
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.ghost {
  background: white;
  color: #0f172a;
}
.ghost:hover {
  background: #f1f5f9;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.danger {
  background: rgba(254, 242, 242, 0.5);
  color: #b91c1c;
  border-color: #fecaca;
}
.danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 30px 0;
  color: #64748b;
}
</style>
