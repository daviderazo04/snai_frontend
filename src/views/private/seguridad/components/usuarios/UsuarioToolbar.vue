<template>
  <div class="toolbar">
    <div class="title-block">
      <h2>Listado de Usuarios</h2>
      <button class="btn-primary" @click="$emit('create')">+ Nuevo Usuario</button>
    </div>
    <div class="filters">
      <label class="field">
        <span class="label">Buscar</span>
        <input 
          type="search" 
          placeholder="Nombre o Cédula..." 
          :value="search"
          @input="$emit('update:search', $event.target.value)"
        />
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps(['search']);
</script>

<style scoped>
/* Estilos exactos de EducacionToolbar.vue */
.toolbar { display: flex; flex-direction: column; gap: 18px; }
.title-block { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.title-block h2 { margin: 0; font-size: 1.2rem; color: #0f172a; }
.btn-primary { border: none; color: white; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: 600; background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25); transition: transform 0.2s ease; }
.btn-primary:hover { transform: translateY(-1px); }
.filters { display: flex; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; flex: 1; max-width: 400px; }
.label { text-transform: uppercase; font-size: 0.72rem; letter-spacing: 1px; font-weight: 700; color: #64748b; }
.field input { padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-size: 0.95rem; color: #0f172a; width: 100%; }
.field input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); }
</style>