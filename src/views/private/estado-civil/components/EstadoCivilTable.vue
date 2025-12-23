<template>
  <div class="table-card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Estado civil</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td class="id-cell">#{{ item.id }}</td>
            <td>
              <div class="name-cell">
                <span class="name">{{ item.nombre }}</span>
              </div>
            </td>
            <td>
              <div class="actions">
                <button class="ghost" type="button" @click="$emit('edit', item)">
                  Editar
                </button>
                <button class="danger" type="button" @click="$emit('remove', item)">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="3">
              <div class="empty">
                <strong>Sin resultados</strong>
                <span>Prueba ajustar el filtro o crear un estado civil nuevo.</span>
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
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 520px;
}

th,
td {
  padding: 14px 16px;
  text-align: left;
  font-size: 0.95rem;
  color: #0f172a;
}

th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
}

tbody tr {
  border-top: 1px solid #e2e8f0;
}

.id-cell {
  color: #475569;
  font-weight: 600;
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ghost,
.danger {
  border: 1px solid transparent;
  background: #f1f5f9;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.ghost:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 24px 0;
  color: #64748b;
}

@media (max-width: 720px) {
  th,
  td {
    padding: 12px;
  }
}
</style>
