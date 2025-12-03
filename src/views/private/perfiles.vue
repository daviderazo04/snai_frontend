<template>
  <div class="launchpad-container">
    
    <header class="welcome-header">
      <div class="user-info">
        <h1 class="greeting">
          Hola, <span class="highlight">{{ user?.nombre || 'Usuario' }}</span>
        </h1>
        <p class="subtitle">Bienvenido al Sistema de Control SNAI</p>
      </div>
      
      <div class="user-badge" v-if="user">
        <div class="avatar">
          {{ getInitials(user.nombre, user.apellido) }}
        </div>
        <div class="badge-text">
          <span class="email">{{ user.correo }}</span>
          <span class="verified">Verificado</span>
        </div>
      </div>
    </header>

    <hr class="divider" />

    <main class="selection-area">
      <h2 class="section-title">¿Con qué perfil deseas operar hoy?</h2>
      
      <div v-if="posiblesPerfiles.length > 0" class="cards-grid">
        <div
          v-for="p in posiblesPerfiles"
          :key="p.id"
          class="role-card"
          :class="{ 'active': selectedPerfil?.id === p.id }"
          @click="selectPerfil(p)"
        >
          <div class="selection-indicator">
            <div class="check-circle"></div>
          </div>

          <div class="card-content">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            
            <h3 class="role-name">{{ p.nombre }}</h3>
            <p class="role-desc">Acceso completo al módulo {{ p.nombre.toLowerCase() }}</p>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>No se encontraron perfiles asignados a tu cuenta.</p>
      </div>

      <div class="action-footer">
        <button
          class="start-btn"
          :disabled="!selectedPerfil || isLoading"
          @click="asignarPerfil"
        >
          <span v-if="!isLoading">Ingresar al Sistema</span>
          <span v-else class="loader"></span>
          <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    </main>

  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { gainAccess } from "../../service/auth.service.js";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const user = ref(null);
    const posiblesPerfiles = ref([]);
    const selectedPerfil = ref(null);
    const isLoading = ref(false);

    const getInitials = (nombre, apellido) => {
      if (!nombre) return "U";
      return `${nombre.charAt(0)}${apellido ? apellido.charAt(0) : ""}`.toUpperCase();
    };

    const loadUserData = () => {
      const userStored = localStorage.getItem("snai_user") || sessionStorage.getItem("snai_user");
      const perfilesStored = sessionStorage.getItem("snai_posibles_perfiles");

      if (userStored) user.value = JSON.parse(userStored);
      if (perfilesStored) posiblesPerfiles.value = JSON.parse(perfilesStored);
    };

    const selectPerfil = (perfil) => {
      selectedPerfil.value = perfil;
    };

    const asignarPerfil = async () => {
      if (!selectedPerfil.value) return;
      isLoading.value = true;

      try {
        const payload = {
          id: selectedPerfil.value.id,
          nombre: selectedPerfil.value.nombre,
        };

        const res = await gainAccess(payload);
        if (res.data?.success) {
          localStorage.setItem("snai_user", JSON.stringify(res.data.data));
          router.push("/app");
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(loadUserData);

    return {
      user,
      posiblesPerfiles,
      selectedPerfil,
      selectPerfil,
      asignarPerfil,
      isLoading,
      getInitials
    };
  },
};
</script>

<style scoped>
/* REGLA DE ORO: No usaremos height: 100vh ni centering flexbox en el contenedor padre */
.launchpad-container {
  /* Ocupa el espacio natural del layout */
  width: 100%;
  max-width: 1200px; /* Un tope razonable para pantallas ultra-anchas */
  margin: 0 auto;
  padding: 10px 20px;
}

/* --- HEADER --- */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.greeting {
  font-size: 2rem;
  color: #1e293b;
  margin: 0;
  font-weight: 700;
}

.highlight {
  color: #2575fc; /* Azul institucional */
}

.subtitle {
  color: #64748b;
  margin: 5px 0 0 0;
  font-size: 1rem;
}

/* Badge de usuario (esquina superior derecha) */
.user-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 1rem;
}

.badge-text {
  display: flex;
  flex-direction: column;
}

.email {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.verified {
  font-size: 0.7rem;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.divider {
  border: none;
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 30px;
}

/* --- SELECCIÓN --- */
.section-title {
  font-size: 1.25rem;
  color: #334155;
  margin-bottom: 20px;
  font-weight: 600;
}

/* GRID DE TARJETAS */
.cards-grid {
  display: grid;
  /* Grid responsivo: crea tantas columnas como quepan (minimo 300px) */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.role-card {
  background: white;
  border: 2px solid #e2e8f0; /* Borde sutil por defecto */
  border-radius: 12px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  border-color: #cbd5e0;
}

/* ESTADO ACTIVO */
.role-card.active {
  border-color: #2575fc;
  background-color: #f8fafc;
  box-shadow: 0 0 0 4px rgba(37, 117, 252, 0.1);
}

/* Check Circle (Radio Button Personalizado) */
.selection-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
}

.check-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  transition: all 0.2s;
}

.role-card.active .check-circle {
  border-color: #2575fc;
  background: #2575fc;
  /* Simula un check blanco dentro */
  box-shadow: inset 0 0 0 4px white; 
}

/* Contenido de la tarjeta */
.icon-box {
  width: 50px;
  height: 50px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
  margin-bottom: 15px;
  transition: all 0.2s;
}

.role-card.active .icon-box {
  background: #eff6ff;
  color: #2575fc;
}

.role-name {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 700;
}

.role-desc {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
}

/* --- FOOTER / BOTÓN --- */
.action-footer {
  display: flex;
  justify-content: flex-end; /* Alineado a la derecha */
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.start-btn {
  background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%);
  color: white;
  padding: 14px 35px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(37, 117, 252, 0.3);
}

.start-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.start-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 117, 252, 0.4);
}

.loader {
  border: 2px solid rgba(255,255,255,0.3);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* MOBILE RESPONSIVE */
@media (max-width: 600px) {
  .welcome-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-badge {
    width: 100%;
  }
  
  .start-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>