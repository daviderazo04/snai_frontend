<template>
  <div class="table-wrap">
    <table class="perfil-table">
      <thead>
        <tr>
          <th>Identificador</th>
          <th>Nombre del Perfil</th>
          <th>Descripción</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in items" :key="row.id">
          <td><span class="id-tag">#{{ row.id }}</span></td>
          <td><span class="profile-name">{{ row.nombre }}</span></td>
          <td class="profile-desc">{{ row.descripcion || 'Sin descripción' }}</td>
          <td class="text-right">
            <button class="btn-edit" @click="$emit('edit', row)">
              <span class="icon">⚙️</span>
              <span>Gestionar Permisos</span>
            </button>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td colspan="4" class="empty-state">No se han definido perfiles de acceso.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps(['items']);
</script>

<style scoped>
.table-wrap { width: 100%; overflow-x: auto; border-radius: 20px; border: 1px solid #e2e8f0; }
.perfil-table { width: 100%; min-width: 800px; border-collapse: separate; border-spacing: 0; background: white; }
.perfil-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; background: #f8fafc; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 800; }
.perfil-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.id-tag { background: #f1f5f9; color: #64748b; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; }
.profile-name { font-weight: 700; color: #0f172a; font-size: 1rem; }
.profile-desc { color: #64748b; font-size: 0.9rem; }
.btn-edit { background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; color: #334155; transition: all 0.2s; }
.btn-edit:hover { background: #f8fafc; border-color: #2563eb; color: #2563eb; }
.text-right { text-align: right; }
.empty-state { text-align: center; padding: 40px; color: #94a3b8; }
</style>
