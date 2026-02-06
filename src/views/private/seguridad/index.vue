<!-- src/views/usuario/Index.vue  (Seguridad y Accesos) -->
<template>
  <div class="page-container">
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">Administración de Sistema</p>
        <h1>Seguridad y Accesos</h1>
        <p class="subtitle">
          Configuración granular de permisos, gestión de perfiles y auditoría de recursos de la API.
        </p>
      </div>

      <div class="hero-stats">
        <div
          v-for="t in availableTabs"
          :key="t.key"
          class="stat-card clickable"
          :class="{ active: currentTab === t.key }"
          @click="setTab(t.key)"
        >
          <span class="label">Módulo</span>
          <strong>{{ t.title }}</strong>
          <span class="hint">{{ t.hint }}</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <div v-if="availableTabs.length === 0" class="no-access">
        No tienes permisos para acceder a Seguridad y Accesos.
      </div>

      <template v-else>
        <Transition name="fade" mode="out-in">
          <component :is="activeComponent" />
        </Transition>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";

import UsuariosView from "./components/usuarios/Index.vue";
import PerfilesView from "./components/perfiles/Index.vue";
import RecursosView from "./components/recursos/Index.vue";

/* ======================
   PERMISOS
====================== */
const permisosStr = localStorage.getItem("snai_permisos");
const permisos = permisosStr ? JSON.parse(permisosStr) : [];

const normalizar = (endpoint) => {
  if (!endpoint) return endpoint;
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
};

const tieneAcceso = (endpoint) => {
  if (!endpoint) return true;
  const ep = normalizar(endpoint);

  const exact = permisos.find((p) => normalizar(p.endpoint) === ep);
  if (exact && exact.VIEW === true) return true;

  return permisos.some((p) => {
    const pe = normalizar(p.endpoint);
    return p.VIEW === true && pe.startsWith(ep + "/");
  });
};

const tieneAccesoAAlguno = (endpoints = []) => {
  if (!Array.isArray(endpoints) || endpoints.length === 0) return true;
  return endpoints.some((ep) => tieneAcceso(ep));
};

/* ======================
   TABS + COMPONENTES
====================== */
const TABS = [
  {
    key: "usuarios",
    title: "Usuarios",
    hint: "Cuentas y Perfiles",
    component: UsuariosView,
    permissionAny: ["/usuario", "/auth/register", "/usuario/perfil"],
  },
  {
    key: "perfiles",
    title: "Perfiles",
    hint: "Roles y Matriz",
    component: PerfilesView,
    permissionAny: ["/perfil"],
  },
  {
    key: "recursos",
    title: "Endpoints",
    hint: "Recursos del Sistema",
    component: RecursosView,
    permissionAny: ["/endpoints"],
  },
];

const availableTabs = computed(() => TABS.filter((t) => tieneAccesoAAlguno(t.permissionAny)));

const currentTab = ref("usuarios");

const activeComponent = computed(() => {
  const tab = availableTabs.value.find((t) => t.key === currentTab.value) || availableTabs.value[0];
  return tab?.component || null;
});

const setTab = (key) => {
  if (availableTabs.value.some((t) => t.key === key)) currentTab.value = key;
};

// ✅ Si el tab actual no está permitido, salta al primero permitido
watchEffect(() => {
  if (availableTabs.value.length === 0) return;
  if (!availableTabs.value.some((t) => t.key === currentTab.value)) {
    currentTab.value = availableTabs.value[0].key;
  }
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1e40af 55%, #0ea5e9 100%);
  color: white;
  padding: 40px;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
  justify-content: space-between;
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}
.hero::before {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -50px;
}
.hero::after {
  width: 180px;
  height: 180px;
  bottom: -40px;
  left: 40px;
}

.hero-main {
  position: relative;
  z-index: 1;
  max-width: 520px;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.7rem;
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
}
.hero-main h1 {
  margin: 0 0 12px;
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.1;
}
.subtitle {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
}

.hero-stats {
  display: flex;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 18px 24px;
  border-radius: 20px;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.3);
}
.stat-card.active {
  background: #ffffff;
  color: #0f172a;
  border-color: white;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
}
.stat-card.active .label,
.stat-card.active .hint {
  color: #64748b;
}
.stat-card .label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
  margin-bottom: 6px;
}
.stat-card strong {
  font-size: 1.25rem;
  font-weight: 700;
}
.stat-card .hint {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 4px;
}

.panel {
  background: #ffffff;
  padding: 32px;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 15px -5px rgba(0, 0, 0, 0.05);
  min-height: 500px;
}

.no-access {
  padding: 22px;
  border-radius: 14px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #ef4444;
  font-weight: 800;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
