<template>
  <div class="launchpad-container">
    <!-- HEADER -->
    <header class="welcome-header">
      <div class="user-info">
        <h1 class="greeting">
          Hola, <span class="highlight">{{ user?.nombre || "Usuario" }}</span>
        </h1>
        <p class="subtitle">Bienvenido al Sistema de Control SNAI</p>
      </div>

      <div class="user-badge" v-if="user">
        <div class="avatar">{{ getInitials(user.nombre, user.apellido) }}</div>
        <div class="badge-text">
          <span class="email">{{ user?.correo || user?.cedula || "—" }}</span>
          <span class="verified">Verificado</span>
        </div>
      </div>
    </header>

    <hr class="divider" />

    <!-- ÁREA PRINCIPAL -->
    <main class="selection-area">
      <div class="top-row">
        <h2 class="section-title">¿Con qué perfil deseas operar hoy?</h2>

        <!-- Botón para re-abrir selección (útil cuando el usuario quiera cambiar) -->
        <button class="switch-btn" @click="reloadPerfiles">
          Cambiar perfil
        </button>
      </div>

      <div v-if="posiblesPerfiles.length > 0" class="cards-grid">
        <div
          v-for="p in posiblesPerfiles"
          :key="p.id"
          class="role-card"
          :class="{ active: selectedPerfil?.id === p.id }"
          @click="selectPerfil(p)"
        >
          <div class="selection-indicator">
            <div class="check-circle"></div>
          </div>

          <div class="card-content">
            <div class="icon-box">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>

            <h3 class="role-name">{{ p.nombre }}</h3>
            <p class="role-desc">Acceso al módulo {{ (p.nombre || "").toLowerCase() }}</p>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>No se encontraron perfiles asignados a tu cuenta.</p>
        <button class="switch-btn" @click="reloadPerfiles">Reintentar</button>
      </div>

      <div class="action-footer">
        <button
          class="start-btn"
          :disabled="!selectedPerfil || isLoading"
          @click="asignarPerfil"
        >
          <span v-if="!isLoading">Ingresar al Sistema</span>
          <span v-else class="loader"></span>

          <svg
            v-if="!isLoading"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </main>

    <!-- TOAST / NOTIFICACIÓN MODAL-LIKE -->
    <transition name="toast-fade">
      <div v-if="toast.open" class="toast-overlay" @click.self="closeToast">
        <div class="toast-card" :class="toast.type">
          <div class="toast-left">
            <div class="toast-icon">
              <span v-if="toast.type === 'success'">✅</span>
              <span v-else-if="toast.type === 'error'">❌</span>
              <span v-else>ℹ️</span>
            </div>
            <div class="toast-text">
              <div class="toast-title">{{ toastTitle }}</div>
              <div class="toast-message">{{ toast.message }}</div>
            </div>
          </div>

          <button class="toast-close" @click="closeToast">Cerrar</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { gainAccess } from "../../service/auth.service.js";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const user = ref(null);
    const posiblesPerfiles = ref([]);
    const selectedPerfil = ref(null);
    const isLoading = ref(false);

    const toast = ref({
      open: false,
      type: "info",
      message: "",
      timeoutMs: 2200,
    });

    const toastTitle = computed(() => {
      if (toast.value.type === "success") return "¡Listo!";
      if (toast.value.type === "error") return "Ocurrió un problema";
      return "Aviso";
    });

    let toastTimer = null;

    const getInitials = (nombre, apellido) => {
      const n = nombre ? nombre.charAt(0) : "U";
      const a = apellido ? apellido.charAt(0) : "";
      return (n + a).toUpperCase();
    };

    const safeParse = (raw) => {
      try {
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    const openToast = (type, message, timeoutMs = 2200) => {
      const msg = String(message || "").trim();
      if (!msg) return;

      toast.value.open = true;
      toast.value.type = type;
      toast.value.message = msg;
      toast.value.timeoutMs = timeoutMs;

      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.value.open = false;
      }, timeoutMs);
    };

    const closeToast = () => {
      toast.value.open = false;
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = null;
    };

    /**
     * Carga perfiles:
     * 1) Primero intenta sessionStorage (flujo normal después del login)
     * 2) Si no hay, usa localStorage (para "cambiar perfil" luego)
     */
    const loadUserData = () => {
      user.value = safeParse(localStorage.getItem("snai_user"));

      const perfilesSession =
        safeParse(sessionStorage.getItem("snai_posibles_perfiles")) || null;

      const perfilesLocal =
        safeParse(localStorage.getItem("snai_posibles_perfiles")) || null;

      const perfiles = perfilesSession || perfilesLocal || [];
      posiblesPerfiles.value = Array.isArray(perfiles) ? perfiles : [];

      // Guardar persistente para poder cambiar luego
      if (posiblesPerfiles.value.length > 0) {
        localStorage.setItem(
          "snai_posibles_perfiles",
          JSON.stringify(posiblesPerfiles.value)
        );
      }

      // Preseleccionar perfil activo si existe
      const perfilActivo = safeParse(localStorage.getItem("snai_perfil_activo"));
      if (perfilActivo?.id) {
        const found = posiblesPerfiles.value.find((p) => p.id === perfilActivo.id);
        if (found) selectedPerfil.value = found;
      }

      // Si solo hay 1 perfil, selección automática
      if (!selectedPerfil.value && posiblesPerfiles.value.length === 1) {
        selectedPerfil.value = posiblesPerfiles.value[0];
      }

      const token = localStorage.getItem("snai_token");
      if (!token || !user.value) {
        router.replace("/login");
      }
    };

    const reloadPerfiles = () => {
      closeToast();
      // Intenta volver a cargar desde localStorage/sessionStorage.
      // Si en el futuro quieres refrescar desde backend, aquí sería el lugar.
      loadUserData();

      if (!posiblesPerfiles.value.length) {
        openToast("info", "No hay perfiles guardados. Inicia sesión nuevamente.", 2600);
      } else {
        openToast("info", "Selecciona un perfil para continuar.", 1600);
      }
    };

    const selectPerfil = (perfil) => {
      selectedPerfil.value = perfil;
      closeToast();
    };

    const asignarPerfil = async () => {
      if (!selectedPerfil.value) return;

      isLoading.value = true;
      closeToast();

      try {
        const payload = {
          id: selectedPerfil.value.id,
          nombre: selectedPerfil.value.nombre,
        };

        const res = await gainAccess(payload);

        if (!res.data?.success) {
          openToast("error", res.data?.message || "No se pudo asignar el perfil", 2800);
          return;
        }

        openToast("success", res.data?.message || "Perfil asignado correctamente", 1400);

        const data = res.data.data;

        // Actualiza token/user si vienen en gain-access
        if (data?.accessToken) localStorage.setItem("snai_token", data.accessToken);
        if (data?.user) {
          localStorage.setItem("snai_user", JSON.stringify(data.user));
          user.value = data.user;
        }

        // Guarda permisos si vienen
        if (Array.isArray(data?.permisos)) {
          localStorage.setItem("snai_permisos", JSON.stringify(data.permisos));
        }

        // Guarda perfil activo
        localStorage.setItem("snai_perfil_activo", JSON.stringify(selectedPerfil.value));

        // IMPORTANTE:
        // Ya NO borres posibles perfiles, porque quieres poder cambiar luego
        // sessionStorage.removeItem("snai_posibles_perfiles");  <-- lo dejamos opcional
        sessionStorage.removeItem("snai_posibles_perfiles"); // puedes dejarlo así si quieres

        setTimeout(() => router.push("/app"), 800);
      } catch (err) {
        console.error("Error asignando perfil:", err);
        openToast("error", "Error de conexión con el servidor", 3000);
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
      getInitials,
      toast,
      toastTitle,
      closeToast,
      reloadPerfiles,
    };
  },
};
</script>

<style scoped>
/* añade esto arriba de selection-area */
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.switch-btn {
  border: 1px solid #e2e8f0;
  background: white;
  color: #334155;
  font-weight: 700;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: transform 0.15s;
}
.switch-btn:hover {
  transform: translateY(-1px);
}

/* (tu CSS original sigue igual; solo agregué top-row y switch-btn)
   pega aquí tu CSS previo tal cual si ya lo tienes completo
*/

.launchpad-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 40px;
  font-family: "Segoe UI", sans-serif;
}
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
.highlight { color: #2575fc; }
.subtitle {
  color: #64748b;
  margin: 5px 0 0 0;
  font-size: 1.1rem;
}
.user-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
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
.badge-text { display: flex; flex-direction: column; }
.email { font-size: 0.9rem; font-weight: 600; color: #334155; }
.verified {
  font-size: 0.75rem;
  color: #10b981;
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
.section-title {
  font-size: 1.4rem;
  color: #334155;
  margin: 0;
  font-weight: 600;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
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
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e0;
}
.role-card.active {
  border-color: #2575fc;
  background-color: #f8fafc;
  box-shadow: 0 0 0 4px rgba(37, 117, 252, 0.15);
}
.selection-indicator { position: absolute; top: 25px; right: 25px; }
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
.role-card.active .icon-box { background: #dbeafe; color: #2575fc; }
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
.empty-state {
  background: #fff;
  border: 1px dashed #cbd5e0;
  border-radius: 12px;
  padding: 18px;
  color: #64748b;
}
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
.loader {
  border: 3px solid rgba(255, 255, 255, 0.3);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Toast */
.toast-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 22px;
  background: rgba(0, 0, 0, 0.08);
  z-index: 9999;
}
.toast-card {
  width: min(680px, calc(100vw - 28px));
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}
.toast-left { display: flex; gap: 12px; align-items: flex-start; }
.toast-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  font-size: 18px;
}
.toast-title { font-weight: 800; color: #0f172a; margin-bottom: 2px; }
.toast-message { color: #475569; font-size: 0.95rem; line-height: 1.35; }
.toast-close {
  border: none;
  background: #f1f5f9;
  color: #0f172a;
  font-weight: 700;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: transform 0.15s;
}
.toast-close:hover { transform: translateY(-1px); }
.toast-card.success { border-color: rgba(16, 185, 129, 0.35); }
.toast-card.success .toast-icon { background: rgba(16, 185, 129, 0.12); }
.toast-card.error { border-color: rgba(239, 68, 68, 0.35); }
.toast-card.error .toast-icon { background: rgba(239, 68, 68, 0.12); }
.toast-card.info { border-color: rgba(59, 130, 246, 0.35); }
.toast-card.info .toast-icon { background: rgba(59, 130, 246, 0.12); }
.toast-fade-enter-active,
.toast-fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.toast-fade-enter-from,
.toast-fade-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 768px) {
  .welcome-header { flex-direction: column; align-items: flex-start; }
  .user-badge { width: 100%; }
  .start-btn { width: 100%; justify-content: center; }
  .top-row { flex-direction: column; align-items: flex-start; }
}
</style>
