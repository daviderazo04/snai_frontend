<template>
  <div class="toolbar">
    <div class="title-section">
      <div class="text-block">
        <h2>Perfiles y Roles</h2>
        <p>Administra los niveles de acceso para los diferentes grupos de usuarios</p>
      </div>

      <div class="actions-right">
        <!-- Botón Limpiar -->
        <button 
          v-if="search" 
          type="button" 
          class="btn-clear" 
          @click="$emit('update:search', '')"
        >
          🧹 Limpiar
        </button>

        <!-- Botón Nuevo Perfil -->
        <button class="btn-add" @click="$emit('create')">
          <span class="plus">+</span> Nuevo Perfil
        </button>
      </div>
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

.title-section { display: flex; justify-content: space-between; align-items: center; gap: 12px; }

.text-block { display: flex; flex-direction: column; gap: 4px; }
.text-block h2 { margin: 0; font-size: 1.6rem; font-weight: 800; color: #0f172a; }
.text-block p { margin: 4px 0 0; color: #64748b; font-size: 0.95rem; }

.actions-right { display: flex; align-items: center; gap: 10px; }

.btn-add {
  background: #2563eb; color: white; border: none; padding: 12px 24px; 
  border-radius: 14px; font-weight: 700; cursor: pointer; 
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.25);
  display: flex; align-items: center; gap: 8px;
  transition: all 0.3s ease;
}
.btn-add:hover { transform: translateY(-2px); box-shadow: 0 12px 20px rgba(37, 99, 235, 0.3); }

.plus { font-size: 1.3rem; line-height: 1; }

.btn-clear {
  border: none;
  background: #f1f5f9;
  padding: 12px 24px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s ease;
}
.btn-clear:hover { background: #e2e8f0; }

.search-section { max-width: 400px; position: relative; }
.input-group .icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.input-group input { width: 100%; padding: 12px 12px 12px 48px; border-radius: 14px; border: 1px solid #e2e8f0; font-size: 0.95rem; }
</style>
