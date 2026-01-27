<!-- src/views/private/educacion/components/EducacionTable.vue -->
<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Adolescente</th>
          <th>Fecha</th>
          <th>Estudia</th>
          <th>Nivel</th>
          <th>Ciclo</th>
          <th>Institución</th>
          <th>Modalidad</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in items" :key="row.id">
          <td>#{{ row.id }}</td>
          <td>{{ row.adolescenteId != null && row.adolescenteId !== '' ? `#${row.adolescenteId}` : "—" }}</td>
          <td>{{ row.fecha || "—" }}</td>
          <td>
            <span class="pill" :class="row.estudia === '1' ? 'pill-yes' : 'pill-no'">
              {{ row.estudia === "1" ? "Sí" : "No" }}
            </span>
          </td>
          <td class="truncate" :title="row.nivel || ''">{{ row.nivel || "—" }}</td>
          <td class="truncate" :title="row.cicloAcademico || ''">{{ row.cicloAcademico || "—" }}</td>
          <td class="truncate" :title="row.institucion || ''">{{ row.institucion || "—" }}</td>
          <td class="truncate" :title="row.modalidad || ''">{{ row.modalidad || "—" }}</td>
          <td class="actions">
            <button @click="$emit('edit', row)">Editar</button>
            <button class="danger" @click="$emit('remove', row)">Eliminar</button>
          </td>
        </tr>

        <tr v-if="!items || items.length === 0">
          <td class="empty" colspan="9">No hay registros para mostrar.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({ items: Array });
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

.truncate {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
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

.pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.78rem;
  border: 1px solid #e2e8f0;
}

.pill-yes {
  color: #065f46;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.18);
}

.pill-no {
  color: #334155;
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.empty {
  text-align: center;
  padding: 16px !important;
  color: #64748b;
  background: #fff;
}
</style>
