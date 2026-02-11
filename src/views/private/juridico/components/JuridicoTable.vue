<template>
  <table class="table">
    <thead>
      <tr>
        <th class="col-id">ID</th>
        <th class="col-adolescente">Adolescente</th>
        <th class="col-delito">Delito</th>
        <th class="col-causa">N° Causa</th>
        <th class="col-juez">Juez</th>
        <th class="col-fecha">Fecha Inicio</th>
        <th class="col-actions">Acciones</th>
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

        <td class="main-text">
          {{ row.delito?.nombre || '—' }}
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
          <div class="actions">
            <button class="view" @click="$emit('view', row)">
              Ver
            </button>
            <button v-if="canEdit" @click="$emit('edit', row)">
              Editar
            </button>
            <button v-if="canEdit" class="danger" @click="$emit('delete', row)">
              Eliminar
            </button>
          </div>
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
  canEdit: {
    type: Boolean,
    default: true,
  },
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
/* ================= TABLE ================= */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

/* ================= COLUMN WIDTHS ================= */
.col-id { width: 70px; }
.col-adolescente { width: 240px; }
.col-delito { width: 160px; }
.col-causa { width: 150px; }
.col-juez { width: 200px; }
.col-fecha { width: 130px; }
.col-actions { width: 170px; }

/* HEADER */
.table thead th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 14px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

/* ACCIONES HEADER AJUSTADO */
.table thead th.col-actions {
  text-align: center;   /* alinear el texto a la derecha */
  padding-right: 24px; /* opcional: espacio visual con botones */
}

/* ================= ROWS ================= */
.table tbody tr:hover td {
  background: #f1f5f9;
}

.table tbody td {
  padding: 14px;
  font-size: 0.95rem;
  color: #0f172a;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

/* ================= TEXT ================= */
.main-text {
  font-weight: 600;
}

.sub-text {
  font-size: 0.8rem;
  color: #64748b;
}

.mono {
  font-family: monospace;
  color: #334155;
}

.text-right {
  text-align: right;
}

/* ================= ACTIONS ================= */
.actions {
  display: inline-flex;
  justify-content: flex-end;
  gap: 8px;
}

.table button {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 7px 16px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.table button:hover {
  background: #f1f5f9;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

/* VER */
.table button.view {
  background: #eff6ff;
  color: #2563eb;
  border-color: #dbeafe;
}

/* ================= EMPTY ================= */
.empty-cell {
  padding: 26px;
  text-align: center;
  font-style: italic;
  color: #94a3b8;
}
</style>
