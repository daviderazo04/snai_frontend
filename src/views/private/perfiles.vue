<template>
  <div class="launchpad-container">
    
    <!-- HEADER (Integrado en la página, NO modal) -->
    <header class="welcome-header">
      <div class="user-info">
        <h1 class="greeting">
          Hola, <span class="highlight">{{ user?.nombre || 'Usuario' }}</span>
        </h1>
        <p class="subtitle">Bienvenido al Sistema de Control SNAI</p>
      </div>
      
      <!-- Badge con Avatar e Info -->
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

    <!-- ÁREA PRINCIPAL -->
    <main class="selection-area">
      <h2 class="section-title">¿Con qué perfil deseas operar hoy?</h2>
      
      <!-- GRID DE TARJETAS -->
      <div v-if="posiblesPerfiles.length > 0" class="cards-grid">
        <div
          v-for="p in posiblesPerfiles"
          :key="p.id"
          class="role-card"
          :class="{ 'active': selectedPerfil?.id === p.id }"
          @click="selectPerfil(p)"
        >
          <!-- Indicador visual de selección -->
          <div class="selection-indicator">
            <div class="check-circle"></div>
          </div>

          <div class="card-content">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            
            <h3 class="role-name">{{ p.nombre }}</h3>
            <p class="role-desc">Acceso al módulo {{ p.nombre.toLowerCase() }}</p>
          </div>
        </div>
      </div>

      <!-- ESTADO VACÍO -->
      <div v-else class="empty-state">
        <p>No se encontraron perfiles asignados a tu cuenta.</p>
      </div>

      <!-- BOTÓN DE ACCIÓN (Alineado al final) -->
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

    // Obtener iniciales de forma segura
    const getInitials = (nombre, apellido) => {
      const n = nombre ? nombre.charAt(0) : "U";
      const a = apellido ? apellido.charAt(0) : "";
      return (n + a).toUpperCase();
    };

    const loadUserData = () => {
      // 1. Leer Usuario de LocalStorage (Guardado en Login)
      const userStored = localStorage.getItem("snai_user");
      
      // 2. Leer Perfiles de SessionStorage (Guardado en Login)
      const perfilesStored = sessionStorage.getItem("snai_posibles_perfiles");

      if (userStored) {
        try {
          user.value = JSON.parse(userStored);
        } catch (e) {
          console.error("Error parseando usuario", e);
        }
      }

      if (perfilesStored) {
        try {
          posiblesPerfiles.value = JSON.parse(perfilesStored);
        } catch (e) {
          console.error("Error parseando perfiles", e);
        }
      }
    };

    const selectPerfil = (perfil) => {
      selectedPerfil.value = perfil;
    };

    const asignarPerfil = async () => {
      if (!selectedPerfil.value) return;
      isLoading.value = true;

      try {
        // PAYLOAD SEGÚN DTO: { id, nombre }
        const payload = {
          id: selectedPerfil.value.id,
          nombre: selectedPerfil.value.nombre,
        };

        const res = await gainAccess(payload);

        if (res.data?.success) {
          // RESPUESTA SEGÚN DTO: data es el User actualizado (con perfilActivo)
          const updatedUser = res.data.data;
          
          // Actualizamos el usuario en storage
          localStorage.setItem("snai_user", JSON.stringify(updatedUser));
          
          // Limpiamos los perfiles temporales
          sessionStorage.removeItem("snai_posibles_perfiles");
          
          router.push("/app");
        }
      } catch (err) {
        console.error("Error asignando perfil:", err);
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
/* ESTILOS DASHBOARD / LAUNCHPAD (No modal) */
.launchpad-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 40px; /* Un poco más de padding para que respire */
  font-family: 'Segoe UI', sans-serif;
}

/* HEADER */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 20px;
}

.greeting {
  font-size: 2.2rem;
  color: #1e293b;
  margin: 0;
  font-weight: 700;
}

.highlight {
  color: #2575fc; /* Azul principal */
}

.subtitle {
  color: #64748b;
  margin: 5px 0 0 0;
  font-size: 1.1rem;
}

/* Badge Usuario */
.user-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.badge-text {
  display: flex;
  flex-direction: column;
}

.email {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.verified {
  font-size: 0.75rem;
  color: #10b981; /* Verde éxito */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.divider {
  border: none;
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 40px;
}

/* SELECCIÓN */
.section-title {
  font-size: 1.4rem;
  color: #334155;
  margin-bottom: 25px;
  font-weight: 600;
}

/* GRID */
.cards-grid {
  display: grid;
  /* Columnas adaptables: mínimo 300px de ancho */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.role-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.06);
  border-color: #cbd5e0;
}

.role-card.active {
  border-color: #2575fc;
  background-color: #f8fafc;
  box-shadow: 0 0 0 4px rgba(37, 117, 252, 0.15);
}

/* Check Circle */
.selection-indicator {
  position: absolute;
  top: 25px;
  right: 25px;
}

.check-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  transition: all 0.2s;
}

.role-card.active .check-circle {
  border-color: #2575fc;
  background: #2575fc;
  box-shadow: inset 0 0 0 4px white; 
}

/* Contenido Tarjeta */
.icon-box {
  width: 56px;
  height: 56px;
  background: #f1f5f9;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
  margin-bottom: 20px;
  transition: all 0.2s;
}

.role-card.active .icon-box {
  background: #dbeafe;
  color: #2575fc;
}

.role-name {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 700;
}

.role-desc {
  margin: 0;
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
}

/* FOOTER */
.action-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.start-btn {
  background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%);
  color: white;
  padding: 16px 40px;
  border: none;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
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
  box-shadow: 0 8px 25px rgba(37, 117, 252, 0.4);
}

/* Loader */
.loader {
  border: 3px solid rgba(255,255,255,0.3);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* RESPONSIVE */
@media (max-width: 768px) {
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