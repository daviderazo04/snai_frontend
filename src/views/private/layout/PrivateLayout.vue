<template>
  <div class="layout">
    <aside class="sidebar">
      
      <div class="brand">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <h3>SNAI <span class="brand-subtitle">Control</span></h3>
      </div>

      <nav class="nav-menu">
        <p class="menu-label">MENU</p>
        
        <router-link to="/app" class="nav-item" exact-active-class="active">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </span>
          Inicio
        </router-link>

        <router-link to="/app/perfiles" class="nav-item" active-class="active">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          Mi Perfil
        </router-link>
                <router-link to="/app/dashboard" class="nav-item" active-class="active">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          Dashboard
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <main class="content-area">
      <header class="top-bar">
        </header>

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

export default {
  setup() {
    const router = useRouter();

    const logout = () => {
      // Limpieza completa
      localStorage.removeItem("snai_token");
      localStorage.removeItem("snai_user");
      sessionStorage.clear();
      
      // Redirección suave
      router.push("/login");
    };

    return { logout };
  },
};
</script>

<style scoped>
/* Reset */
* {
  box-sizing: border-box;
}

.layout {
  display: flex;
  height: 100vh;
  background-color: #f3f4f6; /* Fondo gris muy suave para el contenido */
  font-family: 'Segoe UI', sans-serif;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 260px;
  background: #1e293b; /* Slate Dark */
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 10px rgba(0,0,0,0.05);
  z-index: 10;
  transition: width 0.3s;
}

/* Marca / Logo */
.brand {
  padding: 25px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo-icon {
  background: #2575fc;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.brand h3 {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
}

.brand-subtitle {
  font-weight: 300;
  opacity: 0.7;
  font-size: 0.9rem;
}

/* Navegación */
.nav-menu {
  flex: 1;
  padding: 20px 15px;
}

.menu-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 10px;
  padding-left: 10px;
  font-weight: 600;
  letter-spacing: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.nav-item .icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
}

/* Hover Effect */
.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: white;
  transform: translateX(4px);
}

/* Active State (Cuando estás en la página) */
.nav-item.active {
  background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 117, 252, 0.4);
}

/* --- FOOTER SIDEBAR --- */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1); /* Rojo muy suave transparente */
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* --- MAIN CONTENT --- */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Evita doble scrollbar */
}

.top-bar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 30px;
  /* Aquí puedes añadir elementos a la derecha si quieres en el futuro */
}

.page-container {
  flex: 1;
  padding: 30px;
  overflow-y: auto; /* Scroll solo en el contenido */
}

/* --- TRANSICIONES DE VUE --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>