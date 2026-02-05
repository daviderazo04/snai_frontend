<template>
  <div class="layout">
    <aside class="sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
      
      <div class="brand">
        <img class="brand-logo" :src="logo" alt="SNAI - El Nuevo Ecuador" />
        <button
          class="collapse-btn"
          type="button"
          :title="isSidebarCollapsed ? 'Expandir menú' : 'Contraer menú'"
          @click="toggleSidebar"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline v-if="isSidebarCollapsed" points="9 18 15 12 9 6"></polyline>
            <polyline v-else points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <nav class="nav-menu" aria-label="Menú principal">
        
        <template v-for="group in menuConfig" :key="group.key">
          
          <div v-if="!group.accordion">
            <p class="menu-label" v-if="group.label">{{ group.label }}</p>
            <router-link
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="nav-item"
              :exact-active-class="item.exact ? 'active' : ''"
              active-class="active"
            >
              <span class="icon" v-html="item.iconSvg"></span>
              <span class="label">{{ item.label }}</span>
            </router-link>
          </div>

          <div class="menu-group" v-else-if="shouldShowGroup(group)">
            <button
              class="accordion-btn"
              @click="toggleMenu(group.key)"
              :class="{ 'is-open': menusOpen[group.key] }"
            >
              <span class="menu-label-text">{{ group.label }}</span>
              <svg
                class="chevron"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div class="accordion-content" v-show="menusOpen[group.key]">
              <template v-for="item in group.items" :key="item.path">
                <router-link
                  v-if="tieneAcceso(item.permission)"
                  :to="item.path"
                  class="nav-item"
                  active-class="active"
                >
                  <span class="icon" v-html="item.iconSvg"></span>
                  <span class="label">{{ item.label }}</span>
                </router-link>
              </template>
            </div>
          </div>

        </template>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <main class="content-area">
      <header class="top-bar"></header>
      <section class="page-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </section>
    </main>
  </div>
</template>

<script>
import { useRouter, useRoute } from "vue-router";
import { reactive, watch, onMounted, ref } from "vue";
import logo from "@/assets/snai.png";

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    // Estado del sidebar y menús
    const isSidebarCollapsed = ref(false);
    const menusOpen = reactive({
      gestion: false,
      localidades: false,
      parametros: false,
    });
    const previousMenus = ref(null);

    // --- DEFINICIÓN DE ICONOS SVG (Para mantener limpio el template) ---
    // Nota: He reutilizado el icono de 'link' para varios items porque así estaba en tu código original.
    // Puedes cambiarlos individualmente aquí.
    const icons = {
      gavel: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5-5m0 0-6-6m6 6-6 6"/><path d="M14.5 18.5 7 11"/><path d="m2.8 21.2 4.2-4.2"/><path d="m10 13-5 5"/></svg>`,
      calendar: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
      youth: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
      family: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
      health: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      job: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
      home: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>`,
      user: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      dashboard: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 17v-6"/><path d="M12 17V9"/><path d="M16 17v-3"/></svg>`,
      link: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L12.5 19.57"/></svg>`,
      map: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
      list: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>`,
      building: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7"/></svg>`,
      userCheck: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`,
      users: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.3a3.5 3.5 0 0 1 0 6.8"/></svg>`,
      star: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
      flag: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V3"/><path d="M4 4h12l-2 4 2 4H4"/></svg>`,
      transfer: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3h4v4"/><path d="M7 21H3v-4"/><path d="M21 3L10 14"/><path d="M3 21l11-11"/></svg>`,
      book: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>`
    };

    // --- CONFIGURACIÓN DEL MENÚ ---
    // Aquí defines la estructura. 'Delito' ha sido movido a 'parametros'.
    const menuConfig = [
      {
        key: 'general',
        label: 'GENERAL',
        accordion: false,
        items: [
          { label: 'Inicio', path: '/app', iconSvg: icons.home, exact: true },
          { label: 'Mi Perfil', path: '/app/perfiles', iconSvg: icons.user },
        ]
      },
      {
        key: 'gestion',
        label: 'GESTIÓN',
        accordion: true,
        items: [
          { label: 'Adolescentes', path: '/app/adolescentes', permission: '/adolescentes', iconSvg: icons.youth }, // Icono: Cara feliz
          { label: 'Familia', path: '/app/familia', permission: '/familia', iconSvg: icons.family }, // Icono: Casa/Hogar
          { label: 'Salud', path: '/app/salud', permission: '/salud', iconSvg: icons.health }, // Icono: Pulso cardiaco
          { label: 'Educación', path: '/app/educacion', permission: '/educacion', iconSvg: icons.book },
          { label: 'Ocupacion', path: '/app/ocupacion', permission: '/ocupacion', iconSvg: icons.job }, // Icono: Maletín
          { label: 'Traslados', path: '/app/traslados', permission: '/traslados', iconSvg: icons.transfer },
        ]
      },
      {
        key: 'localidades',
        label: 'LOCALIDADES',
        accordion: true,
        items: [
          { label: 'Provincias', path: '/app/provincias', permission: '/provincias', iconSvg: icons.map },
          { label: 'Cantones', path: '/app/cantones', permission: '/cantones', iconSvg: icons.list },
          { label: 'CAI', path: '/app/cai', permission: '/cai', iconSvg: icons.building },
        ]
      },
      {
        key: 'parametros',
        label: 'PARÁMETROS',
        accordion: true,
        items: [
          { label: 'Delito', path: '/app/delito', permission: '/delito', iconSvg: icons.gavel }, // Icono: Mazo/Ley
          { label: 'Evento', path: '/app/evento', permission: '/evento', iconSvg: icons.calendar }, // Icono: Calendario
          { label: 'Estado civil', path: '/app/estado-civil', permission: '/estado-civil', iconSvg: icons.userCheck },
          { label: 'Etnia', path: '/app/etnia', permission: '/etnia', iconSvg: icons.users },
          { label: 'GDO', path: '/app/gdos', permission: '/gdos', iconSvg: icons.star },
          { label: 'Nacionalidad', path: '/app/nacionalidad', permission: '/nacionalidad', iconSvg: icons.flag },
          { label: 'Parentesco', path: '/app/parentesco', permission: '/parentesco', iconSvg: icons.link },
          { label: 'usuario', path: '/app/usuario', iconSvg: icons.link },

        ]
      }
    ];

    // --- LÓGICA DE PERMISOS ---
    const permisosStr = localStorage.getItem("snai_permisos");
    const permisos = permisosStr ? JSON.parse(permisosStr) : [];

    const normalizar = (endpoint) => {
      if (!endpoint) return endpoint;
      return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    };

    const tieneAcceso = (endpoint) => {
      // Si no requiere endpoint (como 'Inicio'), tiene acceso
      if (!endpoint) return true;
      const ep = normalizar(endpoint);
      const p = permisos.find((perm) => normalizar(perm.endpoint) === ep);
      return !!(p && p.VIEW === true);
    };

    // Función auxiliar para saber si mostrar un grupo (si tiene al menos un hijo visible)
    const shouldShowGroup = (group) => {
      return group.items.some(item => !item.permission || tieneAcceso(item.permission));
    };

    const pathToPermisoEndpoint = (path) => {
      if (!path) return path;
      let cleanPath = path.startsWith("/app") ? path.replace(/^\/app/, "") : path;
      cleanPath = normalizar(cleanPath);
      const parts = cleanPath.split('/').filter(p => p);
      if (parts.length > 0) {
        return "/" + parts[0];
      }
      return cleanPath;
    };
    const toggleMenu = (key) => {
      menusOpen[key] = !menusOpen[key];
    };

    const toggleSidebar = () => {
      if (!isSidebarCollapsed.value) {
        previousMenus.value = { ...menusOpen };
        // Al colapsar, abrimos los menús para que se vean los iconos flotantes si tu CSS lo soporta,
        // o simplemente para que al expandir se sienta fluido.
        Object.keys(menusOpen).forEach((k) => menusOpen[k] = true);
      } else if (previousMenus.value) {
        Object.keys(menusOpen).forEach((k) => menusOpen[k] = !!previousMenus.value[k]);
      }
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    };

    // --- SEGURIDAD DE RUTA ---
    const verificarSeguridadRuta = () => {
      const token = localStorage.getItem("snai_token");
      if (!token) {
        router.push("/login");
        return;
      }
      const ruta = route.path;
      const publicas = ["/app", "/app/dashboard", "/app/perfiles"];
      if (publicas.includes(ruta)) return;

      const endpoint = pathToPermisoEndpoint(ruta);
      if (!tieneAcceso(endpoint)) {
        router.push("/app/dashboard");
      }
    };

    watch(() => route.path, () => verificarSeguridadRuta());
    onMounted(() => verificarSeguridadRuta());

    const logout = () => {
      localStorage.removeItem("snai_token");
      localStorage.removeItem("snai_user");
      localStorage.removeItem("snai_permisos");
      sessionStorage.clear();
      router.push("/login");
    };

    return {
      logo,
      isSidebarCollapsed,
      menusOpen,
      menuConfig,
      toggleSidebar,
      toggleMenu,
      logout,
      tieneAcceso,
      shouldShowGroup
    };
  },
};
</script>

<style scoped>
/* Variables CSS Globales (definidas scoped pero inyectadas con :global para reutilizar) */
:global(:root) {
  --snai-navy: #0b1220;
  --snai-navy-2: #0f172a;
  --snai-blue: #1e3a8a;
  --snai-blue-2: #1d4ed8;
  --snai-yellow: #fbbf24;
  --snai-red: #ef4444;
  --snai-text: #e5e7eb;
  --snai-muted: #94a3b8;
  --snai-sidebar-bg: #f8fafc;
  --snai-sidebar-bg-2: #e2e8f0;
  --snai-sidebar-text: #0f172a;
  --snai-sidebar-muted: #64748b;
  --snai-sidebar-border: rgba(15, 23, 42, 0.08);
  --snai-sidebar-icon-bg: rgba(15, 23, 42, 0.06);
  --snai-sidebar-hover: rgba(15, 23, 42, 0.06);
}

:global(html, body, #app) { height: 100%; width: 100%; margin: 0; }
:global(body) { overflow: hidden; }

* { box-sizing: border-box; }

.layout {
  position: fixed; inset: 0; display: flex; min-height: 100dvh; width: 100%;
  overflow: hidden; background: #f3f4f6; font-family: "Segoe UI", sans-serif;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 300px; height: 100%;
  background: linear-gradient(180deg, var(--snai-sidebar-bg) 0%, var(--snai-sidebar-bg-2) 100%);
  color: var(--snai-sidebar-text);
  display: flex; flex-direction: column;
  border-right: 1px solid var(--snai-sidebar-border);
  overflow: hidden; transition: width 0.2s ease;
}

.brand {
  padding: 16px 16px 14px; border-bottom: 1px solid var(--snai-sidebar-border);
  display: flex; align-items: center; justify-content: center; position: relative;
}

.brand-logo {
  width: 240px; max-width: 100%; height: 56px; object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(15, 23, 42, 0.2));
}

.collapse-btn {
  position: absolute; right: 12px; top: 12px;
  width: 34px; height: 34px; border-radius: 10px;
  border: 1px solid var(--snai-sidebar-border);
  background: #ffffff; color: var(--snai-sidebar-text);
  display: grid; place-items: center; cursor: pointer;
  transition: all 0.2s ease;
}
.collapse-btn:hover { background: #e2e8f0; border-color: rgba(15, 23, 42, 0.18); }

.nav-menu {
  flex: 1; min-height: 0; padding: 14px 12px 18px;
  overflow-y: auto; overflow-x: hidden;
  scrollbar-width: thin; scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
}
.nav-menu::-webkit-scrollbar { width: 8px; }
.nav-menu::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.25); border-radius: 999px;
  border: 2px solid transparent; background-clip: content-box;
}

/* Grupos y Botones */
.menu-group { margin-top: 10px; }

.accordion-btn {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  background: transparent; border: none; cursor: pointer;
  padding: 12px 10px 8px 10px; margin-top: 10px;
  color: var(--snai-sidebar-muted); text-transform: uppercase;
  font-size: 0.75rem; font-weight: 700; letter-spacing: 1px;
  transition: color 0.2s ease;
}
.accordion-btn:hover { color: var(--snai-sidebar-text); }
.menu-label-text { pointer-events: none; }

.chevron { transition: transform 0.3s ease; color: var(--snai-sidebar-muted); opacity: 0.7; }
.accordion-btn:hover .chevron { opacity: 1; }
.accordion-btn.is-open .chevron { transform: rotate(180deg); }

.accordion-content { overflow: hidden; padding-left: 5px; }

.menu-label {
  font-size: 0.75rem; text-transform: uppercase; color: var(--snai-sidebar-muted);
  margin: 24px 0 10px; padding-left: 10px; font-weight: 700; letter-spacing: 1px;
}
.menu-label:first-of-type { margin-top: 10px; }

/* Ítems de Navegación */
.nav-item {
  position: relative; display: flex; align-items: center; gap: 12px;
  padding: 12px 12px; margin: 6px 4px; border-radius: 12px;
  color: #1f2937; text-decoration: none;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.icon {
  width: 38px; height: 38px; border-radius: 12px;
  display: grid; place-items: center;
  background: var(--snai-sidebar-icon-bg); color: #1f2937;
  transition: background 0.18s ease, color 0.18s ease;
}
.icon :deep(svg) { display: block; } /* Asegura que el SVG inyectado se comporte bien */

.label { font-size: 0.98rem; font-weight: 600; }

.nav-item:hover { background: var(--snai-sidebar-hover); color: var(--snai-sidebar-text); }
.nav-item:hover .icon { background: rgba(15, 23, 42, 0.1); color: var(--snai-sidebar-text); }

.nav-item.active {
  color: #ffffff;
  background: linear-gradient(90deg, rgba(29, 78, 216, 0.95) 0%, rgba(30, 58, 138, 0.95) 100%);
  box-shadow: 0 10px 26px rgba(29, 78, 216, 0.18);
}
.nav-item.active .icon { background: rgba(255, 255, 255, 0.18); color: #ffffff; }
.nav-item.active::before {
  content: ""; position: absolute; left: -6px; top: 10px; bottom: 10px; width: 4px;
  border-radius: 999px; background: var(--snai-yellow);
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.15);
}

/* Footer Sidebar */
.sidebar-footer {
  padding: 16px; border-top: 1px solid var(--snai-sidebar-border);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(226, 232, 240, 0.9) 100%);
}

.logout-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 12px; border-radius: 12px; background: rgba(239, 68, 68, 0.95);
  border: 1px solid rgba(239, 68, 68, 0.95); color: #ffffff;
  cursor: pointer; transition: all 0.18s ease; font-size: 0.95rem; font-weight: 700;
}
.logout-btn:hover { background: rgba(255, 92, 92, 0.95); border-color: rgba(255, 92, 92, 0.95); }

/* Sidebar Colapsado */
.sidebar.is-collapsed { width: 92px; }
.sidebar.is-collapsed .brand { padding: 16px 8px; }
.sidebar.is-collapsed .brand-logo { width: 56px; height: 56px; }
.sidebar.is-collapsed .collapse-btn { right: 8px; top: 10px; }
.sidebar.is-collapsed .menu-label,
.sidebar.is-collapsed .menu-label-text,
.sidebar.is-collapsed .label { display: none; }
.sidebar.is-collapsed .nav-item { justify-content: center; padding: 10px 6px; gap: 0; }
.sidebar.is-collapsed .icon { width: 40px; height: 40px; }
.sidebar.is-collapsed .nav-item.active::before { left: -2px; }
.sidebar.is-collapsed .accordion-btn { justify-content: center; padding: 6px 0; }
.sidebar.is-collapsed .accordion-content { padding-left: 0; }

/* Content Area */
.content-area {
  flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden;
}
.top-bar { height: 10px; background: transparent; }
.page-container {
  flex: 1; min-height: 0; padding: 26px; overflow-y: auto; overflow-x: hidden;
}

/* Transiciones */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
