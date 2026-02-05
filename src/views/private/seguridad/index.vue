<template>
  <div class="page-container">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Administración</p>
        <h1>Seguridad</h1>
        <p class="subtitle">
          Gestiona usuarios, roles, permisos y recursos del sistema.
        </p>
      </div>

      <div class="hero-stats">
        <div 
          class="stat-card clickable" 
          :class="{ active: currentTab === 'usuarios' }"
          @click="currentTab = 'usuarios'"
        >
          <span class="label">Módulo</span>
          <strong>Usuarios</strong>
          <span class="hint">Gestión de cuentas</span>
        </div>

        <div 
          class="stat-card clickable" 
          :class="{ active: currentTab === 'perfiles' }"
          @click="currentTab = 'perfiles'"
        >
          <span class="label">Módulo</span>
          <strong>Perfiles</strong>
          <span class="hint">Roles y Permisos</span>
        </div>

        <div 
          class="stat-card clickable" 
          :class="{ active: currentTab === 'recursos' }"
          @click="currentTab = 'recursos'"
        >
          <span class="label">Módulo</span>
          <strong>Recursos</strong>
          <span class="hint">Endpoints API</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <Transition name="fade" mode="out-in">
        <UsuariosView v-if="currentTab === 'usuarios'" />
        <PerfilesView v-else-if="currentTab === 'perfiles'" />
        <RecursosView v-else-if="currentTab === 'recursos'" />
      </Transition>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// Importamos los "Sub-Index" de cada carpeta (crearemos estos archivos abajo)
import UsuariosView from './components/usuarios/Index.vue';
import PerfilesView from './components/perfiles/Index.vue';
import RecursosView from './components/recursos/Index.vue';

const currentTab = ref('usuarios');
</script>

<style scoped>
/* Replicando estilos de index.vue (Educación) */
.page-container { display: flex; flex-direction: column; gap: 24px; }

.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white; padding: 32px; border-radius: 24px; position: relative; overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15); display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: space-between;
}
.hero::before, .hero::after { content: ""; position: absolute; border-radius: 999px; background: rgba(255, 255, 255, 0.08); pointer-events: none; }
.hero::before { width: 300px; height: 300px; top: -100px; right: -50px; }
.hero::after { width: 180px; height: 180px; bottom: -40px; left: 40px; }

.hero-main { position: relative; z-index: 1; max-width: 520px; }
.eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 0.75rem; margin: 0 0 10px; color: rgba(255, 255, 255, 0.8); font-weight: 600; }
.hero-main h1 { margin: 0 0 8px; font-size: 2rem; font-weight: 800; }
.subtitle { margin: 0; font-size: 1.05rem; color: rgba(255, 255, 255, 0.9); }

.hero-stats { display: flex; gap: 12px; position: relative; z-index: 1; }
.stat-card {
  background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 20px; border-radius: 16px; min-width: 130px; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s;
}
.stat-card:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }
.stat-card.active { background: white; color: #0f172a; border-color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
.stat-card.active .label, .stat-card.active .hint { color: #64748b; }

.stat-card .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 4px; }
.stat-card strong { font-size: 1.2rem; font-weight: 700; }
.stat-card .hint { font-size: 0.75rem; opacity: 0.7; margin-top: 2px; }

.panel {
  background: white; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05); min-height: 400px;
}

/* Animación fade simple para tabs */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>