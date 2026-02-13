<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Adolescente</th>
          <th>Representante</th>
          <th>Fecha Inicio</th>
          <th>Fecha Fin</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in items" :key="row.id">
          <td>#{{ row.id }}</td>
          <td>
            <div class="primary">{{ fullName(row.adolescente) }}</div>
            <div class="secondary">{{ row.adolescente?.cedula || "—" }}</div>
          </td>
          <td>
            <div class="primary">{{ fullName(row.representante) }}</div>
            <div class="secondary">{{ row.representante?.cedula || "—" }}</div>
          </td>
          <td>{{ formatDate(row.fechaInicio) }}</td>
          <td>{{ formatDate(row.fechaFin) }}</td>
          <td class="actions text-right">
            <button v-if="canEdit" class="ghost" @click="$emit('edit', row)">Editar</button>
            <button v-if="canEdit" class="danger" @click="$emit('remove', row)">Eliminar</button>
          </td>
        </tr>

        <tr v-if="!items || items.length === 0">
          <td class="empty" colspan="6">No hay vínculos para mostrar.</td>
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

const fullName = (person) => {
  const name = `${person?.nombre ?? ""} ${person?.apellido ?? ""}`.trim();
  return name || "—";
};

const formatDate = (value) => {
  if (!value) return "—";
  return String(value).slice(0, 10);
};
</script>

<style scoped>
.table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
}

.table {
  width: 100%;
  min-width: 900px;
  border-collapse: separate;
  border-spacing: 0;
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

.primary {
  font-weight: 700;
}

.secondary {
  font-size: 0.84rem;
  color: #64748b;
}

.text-right {
  text-align: right;
}

.actions {
  white-space: nowrap;
}

.table button {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  color: #0f172a;
  transition: all 0.2s ease;
  margin-left: 6px;
}

.table button:hover {
  transform: translateY(-1px);
}

.table button.ghost:hover {
  background: #f1f5f9;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.table button.danger {
  color: #b91c1c;
  background: rgba(254, 242, 242, 0.5);
  border-color: #fecaca;
}

.table button.danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.empty {
  text-align: center;
  padding: 24px !important;
  color: #64748b;
  background: #fff;
  font-style: italic;
}
</style>
