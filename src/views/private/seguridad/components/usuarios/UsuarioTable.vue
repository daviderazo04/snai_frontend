<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Cédula</th>
          <th>Correo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in items" :key="u.id">
          <td>
            <div class="cell-main">{{ u.nombre }} {{ u.apellido }}</div>
            <div class="cell-sub">ID: {{ u.id }}</div>
          </td>
          <td>{{ u.cedula }}</td>
          <td>{{ u.correo }}</td>
          <td class="actions">
            <button @click="$emit('assign', u)">🔑 Roles</button>
          </td>
        </tr>
        <tr v-if="items.length === 0"><td colspan="4" class="empty">No hay usuarios.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>defineProps(['items']);</script>

<style scoped>
/* Estilos exactos de EducacionTable.vue */
.table-wrap { width: 100%; overflow-x: auto; border-radius: 16px; }
.table { width: 100%; min-width: 800px; border-collapse: separate; border-spacing: 0; border-radius: 16px; border: 1px solid #e2e8f0; background: white; }
.table th { text-align: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #475569; background: #f8fafc; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; }
.table td { padding: 12px 14px; border-bottom: 1px solid #edf2f7; color: #0f172a; font-size: 0.95rem; vertical-align: middle; }
.table tr:last-child td { border-bottom: none; }
.cell-main { font-weight: 700; color: #0f172a; }
.cell-sub { font-size: 0.78rem; color: #64748b; }
.table button { border: 1px solid #e2e8f0; background: white; padding: 8px 12px; border-radius: 12px; cursor: pointer; font-weight: 700; color: #0f172a; transition: all 0.2s; }
.table button:hover { background: #f8fafc; }
.empty { text-align: center; padding: 20px; color: #64748b; }
</style>