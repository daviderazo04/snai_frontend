<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Adolescente</th>
          <th>Fecha</th>
          <th>Diagnóstico</th>
          <th>Medicación</th>
          <th>Sustancias</th>
          <th>Atenciones</th>
          <th>Discapacidad</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in items" :key="row.id">
          <td>
            <div class="name-cell">
              <span class="name">{{ row.adolescenteNombre }}</span>
              <span class="muted-id">ID: {{ row.adolescenteId }}</span>
            </div>
          </td>

          <td>{{ row.fecha || "—" }}</td>
          
          <td class="truncate" :title="row.diagnostico || ''">
            {{ row.diagnostico || "—" }}
          </td>
          
          <td>
            <span class="pill" :class="row.tomaMedicacion === '1' ? 'pill-yes' : 'pill-no'">
              {{ row.tomaMedicacion === "1" ? "Sí" : "No" }}
            </span>
          </td>
          
          <td>
            <span class="pill" :class="row.consumeSustancia === '1' ? 'pill-warn' : 'pill-no'">
              {{ row.consumeSustancia === "1" ? (row.tipoSustancia || "Sí") : "No" }}
            </span>
          </td>
          
          <td>{{ row.numAtenMedica ?? 0 }}</td>
          
          <td>
            <span class="pill" :class="row.discapacidad === '1' ? 'pill-warn' : 'pill-no'">
              {{ row.discapacidad === "1" ? "Sí" : "No" }}
            </span>
          </td>
          
          <td class="actions text-right">
            <button class="view" @click="$emit('view', row)">Ver</button>
            <button class="ghost" @click="$emit('edit', row)">Editar</button>
            <button class="danger" @click="$emit('remove', row)">Eliminar</button>
          </td>
        </tr>

        <tr v-if="!items || items.length === 0">
          <td class="empty" colspan="8">No hay registros para mostrar.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({ items: Array });
defineEmits(["view", "edit", "remove"]);
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

.name-cell {
  display: flex;
  flex-direction: column;
}
.name {
  font-weight: 600;
  color: #0f172a;
}
.muted-id {
  font-size: 0.75rem;
  color: #94a3b8;
}

.truncate {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-right {
  text-align: right;
}

.actions {
  white-space: nowrap;
}

/* Botones */
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

/* Estilo Botón Ver */
.table button.view {
  color: #2563eb;
  background: #eff6ff;
  border-color: #dbeafe;
}
.table button.view:hover {
  background: #dbeafe;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

/* Estilo Botón Editar */
.table button.ghost:hover {
  background: #f1f5f9;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

/* Estilo Botón Eliminar */
.table button.danger {
  color: #b91c1c;
  background: rgba(254, 242, 242, 0.5);
  border-color: #fecaca;
}
.table button.danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* Pills (Etiquetas) */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.75rem;
  border: 1px solid transparent;
}

.pill-yes {
  color: #065f46;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.18);
}

.pill-no {
  color: #64748b;
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.pill-warn {
  color: #92400e;
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.22);
}

.empty {
  text-align: center;
  padding: 24px !important;
  color: #64748b;
  background: #fff;
  font-style: italic;
}
</style>