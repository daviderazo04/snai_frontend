<template>
  <div class="toolbar">
    <div class="title-section">
      <div class="text-block">
        <h2>Perfiles y Roles</h2>
        <p>Administra los niveles de acceso para los diferentes grupos de usuarios</p>
      </div>
      <button class="btn-add" @click="$emit('create')">
        <span class="plus">+</span> Nuevo Perfil
      </button>
    </div>
    <div class="search-section">
      <div class="input-group">
        <span class="icon">🔍</span>
        <input 
          type="text" 
          placeholder="Filtrar por nombre de perfil..." 
          :value="search"
          @input="$emit('update:search', $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['search']);
</script>

<style scoped>
.toolbar { display: flex; flex-direction: column; gap: 24px; margin-bottom: 8px; }
.title-section { display: flex; justify-content: space-between; align-items: center; }
.title-section h2 { margin: 0; font-size: 1.6rem; font-weight: 800; color: #0f172a; }
.title-section p { margin: 4px 0 0; color: #64748b; font-size: 0.95rem; }
.btn-add { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.25); }
.search-section { max-width: 400px; position: relative; }
.input-group .icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.input-group input { width: 100%; padding: 12px 12px 12px 48px; border-radius: 14px; border: 1px solid #e2e8f0; font-size: 0.95rem; }
</style>
