<template>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Adolescente</th>
        <th>Delito</th>
        <th>N° Causa</th>
        <th>Juez</th>
        <th>Fecha Inicio</th>
        <th class="text-right">Acciones</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="row in items" :key="row.id">
        <td>#{{ row.id }}</td>

        <td>
          <div class="main-text">
            {{ row.adolescente?.nombre }} {{ row.adolescente?.apellido }}
          </div>
          <div class="sub-text" v-if="row.adolescente">
            CI: {{ row.adolescente.cedula }}
          </div>
        </td>

        <td>
          <span class="main-text">
            {{ row.delito?.nombre || '—' }}
          </span>
        </td>

        <td class="mono">
          {{ row.numeroCausa }}
        </td>

        <td>
          {{ row.juez || '—' }}
        </td>

        <td>
          {{ formatDate(row.fechaInicio) }}
        </td>

        <td class="text-right">
          <button class="view" @click="$emit('view', row)">
            Ver
          </button>
          <button @click="$emit('edit', row)">
            Editar
          </button>
          <button class="danger" @click="$emit('delete', row)">
            Eliminar
          </button>
        </td>
      </tr>

      <tr v-if="items.length === 0">
        <td colspan="7" class="empty-cell">
          No hay registros jurídicos.
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
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
  table-layout: fixed;
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

.text-right {
  text-align: right;
}

.main-text {
  font-weight: 600;
}

.sub-text {
  font-size: 0.8rem;
  color: #64748b;
}

.mono {
  font-family: monospace;
}

.empty-cell {
  text-align: center;
  padding: 24px;
  color: #94a3b8;
  font-style: italic;
}

/* Botones */
.table button {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #0f172a;
  transition: all 0.15s ease;
  margin-left: 6px;
}

.table button:hover {
  background: #f1f5f9;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

/* Botón Ver */
.table button.view {
  color: #2563eb;
  background: #eff6ff;
  border-color: #dbeafe;
}

.table button.view:hover {
  background: #dbeafe;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

/* Botón Eliminar */
.table button.danger {
  border: none;
  color: white;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}
</style>
