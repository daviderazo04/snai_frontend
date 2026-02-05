<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre del Perfil</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in items" :key="row.id">
          <td>#{{ row.id }}</td>
          <td><span class="cell-main">{{ row.nombre }}</span></td>
          <td>{{ row.descripcion || '—' }}</td>
          <td class="actions">
            <button @click="$emit('edit', row)">⚙️ Permisos</button>
          </td>
        </tr>
        <tr v-if="items.length === 0"><td colspan="4" class="empty">No hay perfiles.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>defineProps(['items']);</script>

<style scoped>
/* Mismos estilos de tabla */
.table-wrap { width: 100%; overflow-x: auto; border-radius: 16px; }
.table { width: 100%; min-width: 600px; border-collapse: separate; border-spacing: 0; border-radius: 16px; border: 1px solid #e2e8f0; background: white; }
.table th { text-align: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #475569; background: #f8fafc; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; }
.table td { padding: 12px 14px; border-bottom: 1px solid #edf2f7; color: #0f172a; font-size: 0.95rem; }
.table tr:last-child td { border-bottom: none; }
.cell-main { font-weight: 700; color: #0f172a; }
.table button { border: 1px solid #e2e8f0; background: white; padding: 8px 12px; border-radius: 12px; cursor: pointer; font-weight: 700; color: #0f172a; }
.table button:hover { background: #f8fafc; }
.empty { text-align: center; padding: 20px; color: #64748b; }
</style>