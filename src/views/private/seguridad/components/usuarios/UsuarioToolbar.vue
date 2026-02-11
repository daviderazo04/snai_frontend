<template>
  <div class="toolbar-container">
    <div class="header-row">
      <div class="title-section">
        <h2 class="main-title">Personal del Sistema</h2>
        <p class="subtitle">Gestión de cuentas de usuario y perfiles asignados</p>
      </div>

      <div class="actions-right">
        <!-- Botón Limpiar -->
        <button
          v-if="search"
          type="button"
          class="btn-clear"
          @click="clearSearch"
        >
          🧹 Limpiar
        </button>

        <button class="btn-create" @click="$emit('create')">
          <span class="icon">+</span>
          <span>Añadir Usuario</span>
        </button>
      </div>
    </div>

    <div class="filter-row">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o número de cédula..."
          :value="search"
          @input="$emit('update:search', $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['search']);
const emit = defineEmits(['update:search', 'create']);

const clearSearch = () => {
  emit('update:search', '');
};
</script>

<style scoped>
.toolbar-container { display: flex; flex-direction: column; gap: 24px; margin-bottom: 12px; }

.header-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }

.title-section { display: flex; flex-direction: column; gap: 4px; }
.main-title { margin: 0; font-size: 1.5rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
.subtitle { margin: 0; font-size: 0.95rem; color: #64748b; }

.actions-right { display: flex; align-items: center; gap: 10px; }

.btn-create {
  border: none; color: white; padding: 12px 24px; border-radius: 14px;
  cursor: pointer; font-weight: 700; font-size: 0.95rem;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  display: flex; align-items: center; gap: 10px;
  transition: all 0.3s ease;
}

.btn-create:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(37, 99, 235, 0.3); }
.btn-create .icon { font-size: 1.4rem; line-height: 1; }

/* Botón Limpiar al lado derecho del header */
.btn-clear {
  border: none;
  background: #f1f5f9;
  padding: 10px 16px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s ease;
}

.btn-clear:hover { background: #e2e8f0; }

.filter-row { display: flex; width: 100%; }
.search-box { position: relative; flex: 1; max-width: 500px; }

.search-icon {
  position: absolute; left: 16px; top: 50%;
  transform: translateY(-50%); font-size: 1rem; color: #94a3b8;
}

.search-box input {
  width: 100%; padding: 14px 14px 14px 48px;
  border-radius: 16px; border: 1px solid #e2e8f0;
  background: white; font-size: 1rem; color: #0f172a;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.search-box input:focus {
  outline: none; border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  background: #fff;
}

.search-box input::placeholder { color: #cbd5e1; }
</style>
