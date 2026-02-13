<template>
  <div class="dashboard-container">
    
    <section class="welcome-hero">
      <div class="hero-content">
        <p class="date-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          {{ currentDate }}
        </p>
        <h1>{{ greeting }}, bienvenido al SNAI</h1>
        <p class="subtitle">
          Sistema Nacional de Atención Integral a Personas Adultas Privadas de la Libertad y a Adolescentes Infractores.
        </p>
      </div>
      <div class="hero-decoration">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
      </div>
    </section>

    <div class="section-header">
      <h2>Accesos Directos</h2>
      <p>Módulos de gestión frecuente</p>
    </div>

    <div v-if="visibleModules.length === 0" class="no-access">
      <div class="icon-lock">🔒</div>
      <p>No tienes módulos asignados. Contacta al administrador.</p>
    </div>

    <section v-else class="modules-grid">
      <router-link 
        v-for="mod in visibleModules" 
        :key="mod.route" 
        :to="mod.route" 
        class="module-card"
      >
        <div class="icon-box" :class="mod.color">
          <span v-html="mod.icon"></span>
        </div>
        
        <div class="card-info">
          <h3>{{ mod.title }}</h3>
          <p>{{ mod.desc }}</p>
        </div>
        
        <div class="arrow-icon">→</div>
      </router-link>
    </section>

    <section class="info-panels">
      <div class="info-card">
        <h3>Estado del Sistema</h3>
        <div class="status-indicator">
          <span class="dot online"></span>
          <span>Servicios Operativos</span>
        </div>
        <p class="description">Todos los módulos se encuentran sincronizados y funcionando correctamente.</p>
      </div>
      
      <div class="info-card">
        <h3>Soporte Técnico</h3>
        <p class="description">Si presentas inconvenientes con la plataforma, contacta a la mesa de ayuda.</p>
        <button class="ghost-btn">Reportar problema</button>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const now = new Date();

// --- 1. Lógica de Fecha y Saludo ---
const currentDate = computed(() => {
  return now.toLocaleDateString('es-EC', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

const greeting = computed(() => {
  const hour = now.getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
});

// --- 2. Lógica de Seguridad ---
const permisosStr = localStorage.getItem("snai_permisos");
const permisos = permisosStr ? JSON.parse(permisosStr) : [];

const tieneAcceso = (endpoint) => {
  // Normalizamos para asegurar que siempre empiece con /
  const ep = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const permisoEncontrado = permisos.find((p) => {
    const pEp = p.endpoint.startsWith("/") ? p.endpoint : `/${p.endpoint}`;
    return pEp === ep;
  });
  return !!(permisoEncontrado && permisoEncontrado.VIEW === true);
};

// --- 3. Configuración de Módulos ---
// Aquí definimos la data que antes estaba "quemada" en el HTML
const allModules = [
  {
    title: 'Adolescentes',
    desc: 'Gestión de expedientes e historial.',
    route: '/app/adolescentes',
    permission: '/adolescentes', // Endpoint que valida el permiso
    color: 'blue',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`
  },
  {
    title: 'Familia',
    desc: 'Visitas y entorno familiar.',
    route: '/app/familia',
    permission: '/familia',
    color: 'green',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
  },
  {
    title: 'Representantes',
    desc: 'Datos de representantes legales.',
    route: '/app/representantes',
    permission: '/representantes',
    color: 'blue',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.3a3.5 3.5 0 0 1 0 6.8"/></svg>`
  },
  {
    title: 'Vínculo representante',
    desc: 'Relación entre adolescente y representante.',
    route: '/app/rep-infractores',
    permission: '/rep-infractores',
    color: 'green',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L12.5 19.57"/></svg>`
  },
  {
    title: 'Salud',
    desc: 'Fichas médicas y seguimiento.',
    route: '/app/salud',
    permission: '/salud',
    color: 'red',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
  },
  {
    title: 'Ocupación',
    desc: 'Talleres y actividades laborales.',
    route: '/app/ocupacion',
    permission: '/ocupacion',
    color: 'orange',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
  }
];

// Filtramos la lista basándonos en los permisos
const visibleModules = computed(() => {
  return allModules.filter(m => tieneAcceso(m.permission));
});
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* --- HERO SECTION --- */
.welcome-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #38bdf8 100%);
  border-radius: 24px;
  padding: 40px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(30, 58, 138, 0.2);
  display: flex;
  align-items: center;
  min-height: 220px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 16px;
  text-transform: capitalize;
}

.welcome-hero h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
  color: #e0e7ff;
}

.hero-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}
.c1 { width: 300px; height: 300px; top: -100px; right: -50px; }
.c2 { width: 180px; height: 180px; bottom: -40px; right: 150px; }

/* --- GRID DE MÓDULOS --- */
.section-header h2 {
  font-size: 1.4rem;
  color: #1e293b;
  margin: 0 0 4px 0;
}
.section-header p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.module-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #cbd5e1;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-box.blue { background: #eff6ff; color: #2563eb; }
.icon-box.green { background: #f0fdf4; color: #16a34a; }
.icon-box.red { background: #fef2f2; color: #dc2626; }
.icon-box.orange { background: #fff7ed; color: #ea580c; }

.card-info { flex: 1; } /* Asegura que ocupe el espacio */

.card-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: #0f172a;
  font-weight: 700;
}
.card-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.arrow-icon {
  margin-left: auto;
  color: #cbd5e1;
  font-weight: 600;
  transition: transform 0.2s, color 0.2s;
}
.module-card:hover .arrow-icon {
  color: #3b82f6;
  transform: translateX(4px);
}

/* --- Estado sin accesos --- */
.no-access {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}
.icon-lock { font-size: 2rem; margin-bottom: 10px; opacity: 0.5; }

/* --- PANELES INFORMATIVOS --- */
.info-panels {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.info-card h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.online {
  background-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.ghost-btn {
  margin-top: 12px;
  background: transparent;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 8px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.ghost-btn:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-hero h1 { font-size: 1.8rem; }
  .info-panels { grid-template-columns: 1fr; }
}
</style>
