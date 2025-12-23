<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <!-- ✅ Logo real -->
        <img class="brand-logo" :src="logo" alt="SNAI - El Nuevo Ecuador" />
      </div>

      <nav class="nav-menu" aria-label="Menú principal">
        <p class="menu-label">MENU</p>

        <router-link to="/app" class="nav-item" exact-active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- Grid -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </span>
          <span class="label">Inicio</span>
        </router-link>

        <router-link to="/app/perfiles" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- User -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span class="label">Mi Perfil</span>
        </router-link>

        <router-link to="/app/dashboard" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- Bar chart -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19V5" />
              <path d="M4 19h16" />
              <path d="M8 17v-6" />
              <path d="M12 17V9" />
              <path d="M16 17v-3" />
            </svg>
          </span>
          <span class="label">Dashboard</span>
        </router-link>

        <router-link to="/app/etnia" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- Users -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9.5" cy="7" r="3.5" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.3a3.5 3.5 0 0 1 0 6.8" />
            </svg>
          </span>
          <span class="label">Etnia</span>
        </router-link>

        <router-link to="/app/nacionalidad" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- Flag -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 22V3" />
              <path d="M4 4h12l-2 4 2 4H4" />
            </svg>
          </span>
          <span class="label">Nacionalidad</span>
        </router-link>

        <router-link to="/app/gdos" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- Layers -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2 2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <span class="label">G2</span>
        </router-link>

        <router-link to="/app/parentesco" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- Link -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43" />
              <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L12.5 19.57" />
            </svg>
          </span>
          <span class="label">Parentesco</span>
        </router-link>

        <router-link to="/app/provincias" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- Map pin -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <span class="label">Provincias</span>
        </router-link>

        <router-link to="/app/cantones" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- List -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          </span>
          <span class="label">Cantones</span>
        </router-link>

        <router-link to="/app/cai" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- Database -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="8" ry="3" />
              <path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
              <path d="M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" />
            </svg>
          </span>
          <span class="label">CAI</span>
        </router-link>

        <router-link to="/app/estado-civil" class="nav-item" active-class="active">
          <span class="icon" aria-hidden="true">
            <!-- Heart -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </span>
          <span class="label">Estado civil</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <main class="content-area">
      <!-- Si no lo usas, puedes borrar este header -->
      <header class="top-bar" aria-hidden="true"></header>

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
import { useRouter } from "vue-router";
import logo from "@/assets/snai.png"; // ✅ src/assets/snai.png

export default {
  setup() {
    const router = useRouter();

    const logout = () => {
      localStorage.removeItem("snai_token");
      localStorage.removeItem("snai_user");
      sessionStorage.clear();
      router.push("/login");
    };

    return { logout, logo };
  },
};
</script>

<style scoped>
/* ===== Paleta basada en el logo ===== */
:global(:root) {
  --snai-navy: #0b1220;
  --snai-navy-2: #0f172a;
  --snai-blue: #1e3a8a;   /* azul */
  --snai-blue-2: #1d4ed8; /* azul vivo */
  --snai-yellow: #fbbf24; /* amarillo */
  --snai-red: #ef4444;    /* rojo */
  --snai-text: #e5e7eb;
  --snai-muted: #94a3b8;
}

/* scoped NO afecta html/body/#app */
:global(html, body, #app) {
  height: 100%;
  width: 100%;
  margin: 0;
}
:global(body) {
  overflow: hidden;
}

* { box-sizing: border-box; }

.layout {
  position: fixed;
  inset: 0;
  display: flex;
  min-height: 100dvh;
  width: 100%;
  overflow: hidden;
  background: #f3f4f6;
  font-family: "Segoe UI", sans-serif;
}

/* Sidebar */
.sidebar {
  width: 300px;
  height: 100%;
  background: linear-gradient(180deg, var(--snai-navy) 0%, var(--snai-navy-2) 100%);
  color: var(--snai-text);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

/* Brand con logo */
.brand {
  padding: 16px 16px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo {
  width: 240px;
  max-width: 100%;
  height: 56px;
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.35));
}

/* Nav */
.nav-menu {
  flex: 1;
  min-height: 0;
  padding: 14px 12px 18px;
  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.35) transparent;
}
.nav-menu::-webkit-scrollbar { width: 8px; }
.nav-menu::-webkit-scrollbar-track { background: transparent; }
.nav-menu::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.nav-menu:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.38);
  border: 2px solid transparent;
  background-clip: content-box;
}

.menu-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--snai-muted);
  margin: 10px 0 10px;
  padding-left: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

/* Items */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  margin: 6px 4px;
  border-radius: 12px;
  color: #cbd5e1;
  text-decoration: none;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  transition: background 0.18s ease, color 0.18s ease;
}

.label {
  font-size: 0.98rem;
  font-weight: 600;
}

/* Hover */
.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}
.nav-item:hover .icon {
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

/* Active: azul con acentos del logo */
.nav-item.active {
  color: #ffffff;
  background: linear-gradient(90deg, rgba(29, 78, 216, 0.95) 0%, rgba(30, 58, 138, 0.95) 100%);
  box-shadow: 0 10px 26px rgba(29, 78, 216, 0.18);
}
.nav-item.active .icon {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

/* Indicador lateral: amarillo (logo) */
.nav-item.active::before {
  content: "";
  position: absolute;
  left: -6px;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 999px;
  background: var(--snai-yellow);
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.15);
}

/* Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.7) 100%);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;

  background: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fecaca;

  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  font-size: 0.95rem;
  font-weight: 700;
}
.logout-btn:hover {
  background: rgba(239, 68, 68, 0.95);
  border-color: rgba(239, 68, 68, 0.95);
  color: #ffffff;
}

/* Content */
.content-area {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top bar opcional (sin línea) */
.top-bar {
  height: 10px; /* si no lo usas, mantenlo mínimo o elimínalo del template */
  background: transparent;
}

.page-container {
  flex: 1;
  min-height: 0;
  padding: 26px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Vue transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
