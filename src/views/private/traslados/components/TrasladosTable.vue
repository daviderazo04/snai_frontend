<!-- src/views/private/traslados/components/TrasladosTable.vue -->
<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Adolescente</th>
          <th>CAI Origen</th>
          <th>CAI Destino</th>
          <th>Fecha</th>
          <th>Observaciones</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in items" :key="row.id">
          <td class="id-cell">#{{ row.id }}</td>
          <td>
            <div class="cell-main">{{ row.adolescenteNombre || "—" }}</div>
            <div v-if="row.adolescenteId" class="cell-sub">ID {{ row.adolescenteId }}</div>
          </td>
          <td>
            <div class="cell-main">{{ row.fromCaiNombre || "—" }}</div>
            <div v-if="row.fromCaiId" class="cell-sub">ID {{ row.fromCaiId }}</div>
          </td>
          <td>
            <div class="cell-main">{{ row.caiNombre || "—" }}</div>
            <div v-if="row.caiId" class="cell-sub">ID {{ row.caiId }}</div>
          </td>
          <td>{{ row.fecha || "—" }}</td>
          <td class="truncate" :title="row.observaciones || ''">{{ row.observaciones || "—" }}</td>
          <td class="text-right">
            <div class="actions">
              <button v-if="canEdit" class="ghost" @click="$emit('edit', row)">Editar</button>
              <button v-if="canEdit" class="danger" @click="$emit('remove', row)">Eliminar</button>
            </div>
          </td>
        </tr>

        <tr v-if="!items || items.length === 0">
          <td class="empty" colspan="6">
            No hay traslados registrados.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  canEdit: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["edit", "remove"]);
</script>

<style scoped>
.table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
}

.table {
  width: 100%;
  min-width: 980px;
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
  white-space: nowrap;
}

.table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid #edf2f7;
  color: #0f172a;
  font-size: 0.95rem;
  vertical-align: middle;
  white-space: nowrap;
}

.table tbody tr:hover td {
  background: #f8fafc;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.id-cell {
  color: #64748b;
  font-family: monospace;
  font-weight: 700;
}

.cell-main {
  font-weight: 600;
  color: #0f172a;
}

.cell-sub {
  font-size: 0.78rem;
  color: #64748b;
}

.truncate {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-right {
  text-align: right;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

button {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.ghost:hover {
  background: #f1f5f9;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.danger {
  color: #b91c1c;
  background: rgba(254, 242, 242, 0.5);
  border-color: #fecaca;
}

.danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.empty {
  text-align: center;
  padding: 16px !important;
  color: #64748b;
  background: #fff;
}
</style>
