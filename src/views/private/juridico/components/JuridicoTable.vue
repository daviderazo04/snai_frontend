<template>
  <div class="table-card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
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
            <td>
              <div class="name-cell">
                <span class="name">
                  {{ row.adolescente?.nombre }} {{ row.adolescente?.apellido }}
                </span>
                <span class="muted" v-if="row.adolescente">
                  CI: {{ row.adolescente.cedula }}
                </span>
              </div>
            </td>

            <td>
              <div class="cell-content">
                <strong>{{ row.delito?.nombre || '—' }}</strong>
              </div>
            </td>

            <td>
              <span class="badge mono">
                {{ row.numeroCausa }}
              </span>
            </td>

            <td>
              <span>{{ row.juez || '—' }}</span>
            </td>

            <td>
              <span class="muted">
                {{ formatDate(row.fechaInicio) }}
              </span>
            </td>

            <td class="text-right">
              <div class="actions">
                <button class="view" @click="$emit('view', row)">Ver</button>
                <button class="ghost" @click="$emit('edit', row)">Editar</button>
              </div>
            </td>
          </tr>

          <tr v-if="items.length === 0">
            <td colspan="6">
              <div class="empty">
                <div class="empty-icon">📂</div>
                <strong>No hay registros jurídicos</strong>
                <span>Intenta cambiar los filtros o crear uno nuevo.</span>
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
  items: {
    type: Array,
    default: () => [],
  },
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
.table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

th,
td {
  padding: 16px 20px;
  text-align: left;
  font-size: 0.95rem;
  color: #0f172a;
  vertical-align: middle;
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

tbody tr:last-child {
  border-bottom: none;
}

/* Cells */
.name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-weight: 700;
}

.muted {
  color: #64748b;
  font-size: 0.8rem;
}

.badge {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  color: #334155;
}

.mono {
  font-family: monospace;
}

.cell-content {
  display: flex;
  flex-direction: column;
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
  background: white;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.view {
  color: #2563eb;
  background: #eff6ff;
  border-color: #dbeafe;
}

.view:hover {
  background: #dbeafe;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
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
}

/* Empty */
.empty {
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  opacity: 0.5;
}
</style>
