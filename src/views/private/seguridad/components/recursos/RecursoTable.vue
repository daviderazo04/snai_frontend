<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Ruta (Endpoint)</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in items" :key="r.endpoint">
          <td><span class="mono">{{ r.endpoint }}</span></td>
          <td>{{ r.descripcion }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>defineProps(['items']);</script>

<style scoped>
.table-wrap { width: 100%; overflow-x: auto; border-radius: 16px; }
.table { width: 100%; min-width: 600px; border-collapse: separate; border-spacing: 0; border-radius: 16px; border: 1px solid #e2e8f0; background: white; }
.table th { text-align: left; font-size: 0.78rem; text-transform: uppercase; color: #475569; background: #f8fafc; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; }
.table td { padding: 12px 14px; border-bottom: 1px solid #edf2f7; color: #0f172a; font-size: 0.95rem; }
.mono { font-family: monospace; color: #2563eb; font-weight: 600; }
</style>