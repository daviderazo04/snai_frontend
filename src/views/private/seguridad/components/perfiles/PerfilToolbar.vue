<template>
  <div class="toolbar">
    <div class="title-block">
      <h2>Listado de Perfiles</h2>
      <button class="btn-primary" @click="$emit('create')">+ Nuevo Perfil</button>
    </div>
    <div class="filters">
      <label class="field">
        <span class="label">Buscar</span>
        <input 
          type="search" 
          placeholder="Nombre del perfil..." 
          :value="search"
          @input="$emit('update:search', $event.target.value)"
        />
      </label>
    </div>
  </div>
</template>

<script setup>defineProps(['search']);</script>

<style scoped>
/* Misma estructura que UsuarioToolbar */
.toolbar { display: flex; flex-direction: column; gap: 18px; }
.title-block { display: flex; align-items: center; justify-content: space-between; }
.title-block h2 { margin: 0; font-size: 1.2rem; color: #0f172a; }
.btn-primary { border: none; color: white; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: 600; background: linear-gradient(135deg, #2563eb, #1d4ed8); }
.filters { display: flex; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; flex: 1; max-width: 400px; }
.label { text-transform: uppercase; font-size: 0.72rem; letter-spacing: 1px; font-weight: 700; color: #64748b; }
.field input { padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-size: 0.95rem; }
.field input:focus { border-color: #2563eb; outline: none; }
</style>