<!-- src/views/private/evento/components/EventoTable.vue -->
<template>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Acciones</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="row in items" :key="row.id">
        <td>#{{ row.id }}</td>
        <td>{{ row.nombre }}</td>
        <td class="actions">
          <button @click="$emit('edit', row)">Editar</button>
          <button class="danger" @click="$emit('remove', row)">Eliminar</button>
        </td>
      </tr>

      <tr v-if="!items || items.length === 0">
        <td class="empty" colspan="3">No hay eventos para mostrar.</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({ items: Array });
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: white;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.table thead th {
  text-align: left;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #475569;
  background: #f8fafc;
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
}

.table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid #edf2f7;
  color: #0f172a;
  font-size: 0.95rem;
  vertical-align: middle;
}

.table tbody tr:hover td {
  background: #f8fafc;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.actions {
  width: 220px;
  white-space: nowrap;
}

.table button {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  color: #0f172a;
  transition: transform 0.08s ease, box-shadow 0.15s ease, background 0.15s ease;
  margin-right: 8px;
}

.table button:hover {
  background: #f8fafc;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}

.table button:active {
  transform: translateY(1px);
}

.table button.danger {
  border: none;
  color: white;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  box-shadow: 0 14px 28px rgba(239, 68, 68, 0.18);
}

.empty {
  text-align: center;
  padding: 16px !important;
  color: #64748b;
  background: #fff;
}
</style>
