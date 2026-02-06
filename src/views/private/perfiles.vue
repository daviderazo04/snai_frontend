<template>
  <div class="launchpad-container">
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

    <main class="selection-area">
      <div class="top-row">
        <h2 class="section-title">¿Con qué perfil deseas operar hoy?</h2>

        <button class="switch-btn" :disabled="isRefreshing" @click="reloadPerfiles">
          {{ isRefreshing ? 'Actualizando...' : 'Cambiar perfil' }}
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
            <div class="icon-box" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <button class="switch-btn" :disabled="isRefreshing" @click="reloadPerfiles">Reintentar</button>
      </div>

      <div class="action-footer">
        <button class="start-btn" :disabled="!selectedPerfil || isLoading" @click="asignarPerfil">
          <span v-if="!isLoading">Ingresar al Sistema</span>
          <span v-else class="loader"></span>

          <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </main>

    <transition name="toast-fade">
      <div v-if="toast.open" class="toast-overlay" @click.self="closeToast">
        <div class="toast-card" :class="toast.type">
          <div class="toast-left">
            <div class="toast-icon">
              <span v-if="toast.type === 'success'">✓</span>
              <span v-else-if="toast.type === 'error'">!</span>
              <span v-else>i</span>
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
import { ref, onMounted, onActivated, computed } from "vue";
import { gainAccess } from "../../service/auth.service.js";
import { getDetalleUsuario } from "../../service/users-roles.service.js";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const user = ref(null);
    const posiblesPerfiles = ref([]);
    const selectedPerfil = ref(null);
    const isLoading = ref(false);
    const isRefreshing = ref(false);

    const toast = ref({
      open: false,
      type: "info",
      message: "",
      timeoutMs: 2200,
    });

    const toastTitle = computed(() => {
      if (toast.value.type === "success") return "Operación exitosa";
      if (toast.value.type === "error") return "Atención";
      return "Información";
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

    const dedupeById = (arr) => {
      const map = new Map();
      (arr || []).forEach((p) => {
        if (p && p.id != null) map.set(Number(p.id), p);
      });
      return Array.from(map.values());
    };

    const ensureAuthOrRedirect = () => {
      const token = localStorage.getItem("snai_token");
      const u = safeParse(localStorage.getItem("snai_user"));
      if (!token || !u) {
        router.replace("/login");
        return false;
      }
      user.value = u;
      return true;
    };

    // Carga rápida desde storage (para pintar algo)
    const loadFromStorage = () => {
      user.value = safeParse(localStorage.getItem("snai_user"));

      const perfilesSession = safeParse(sessionStorage.getItem("snai_posibles_perfiles")) || null;
      const perfilesLocal = safeParse(localStorage.getItem("snai_posibles_perfiles")) || null;

      const perfiles = perfilesSession || perfilesLocal || [];
      posiblesPerfiles.value = Array.isArray(perfiles) ? dedupeById(perfiles) : [];

      // Mantener perfil activo si existe en lista
      const perfilActivo = safeParse(localStorage.getItem("snai_perfil_activo"));
      if (perfilActivo?.id) {
        const found = posiblesPerfiles.value.find((p) => Number(p.id) === Number(perfilActivo.id));
        if (found) selectedPerfil.value = found;
      }

      if (!selectedPerfil.value && posiblesPerfiles.value.length === 1) {
        selectedPerfil.value = posiblesPerfiles.value[0];
      }
    };

    // ✅ REFRESCO REAL desde backend (lo que te faltaba)
    const refreshPerfilesFromServer = async (silent = false) => {
      if (!ensureAuthOrRedirect()) return;

      if (isRefreshing.value) return;
      isRefreshing.value = true;

      try {
        const res = await getDetalleUsuario(user.value.id);
        if (!res?.data?.success) {
          if (!silent) openToast("error", res?.data?.message || "No se pudo actualizar perfiles", 2600);
          return;
        }

        const detalle = res.data.data;
        // actualiza user por si cambió algo (opcional)
        if (detalle) {
          localStorage.setItem("snai_user", JSON.stringify(detalle));
          user.value = detalle;
        }

        const nuevosPerfiles = dedupeById(detalle?.perfiles || []);
        posiblesPerfiles.value = nuevosPerfiles;

        // Persistimos SIEMPRE el listado actualizado
        localStorage.setItem("snai_posibles_perfiles", JSON.stringify(nuevosPerfiles));
        sessionStorage.setItem("snai_posibles_perfiles", JSON.stringify(nuevosPerfiles));

        // Mantener selección si sigue existiendo
        if (selectedPerfil.value?.id) {
          const still = nuevosPerfiles.find((p) => Number(p.id) === Number(selectedPerfil.value.id));
          selectedPerfil.value = still || null;
        }

        // Si no hay selección, auto-selecciona si hay 1
        if (!selectedPerfil.value && nuevosPerfiles.length === 1) {
          selectedPerfil.value = nuevosPerfiles[0];
        }

        if (!silent) {
          openToast("success", "Perfiles actualizados correctamente.", 1400);
        }
      } catch (err) {
        console.error("Error actualizando perfiles:", err);
        const msg = err?.response?.data?.message || "Error de conexión con el servidor";
        if (!silent) openToast("error", msg, 2800);

        // si falla, al menos deja lo que haya en storage
        loadFromStorage();
      } finally {
        isRefreshing.value = false;
      }
    };

    const reloadPerfiles = async () => {
      closeToast();
      // refresca desde backend (no storage)
      await refreshPerfilesFromServer(false);

      if (!posiblesPerfiles.value.length) {
        openToast("info", "No hay perfiles asignados aún. Contacta al administrador.", 2600);
      } else if (!selectedPerfil.value) {
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
        const payload = { id: selectedPerfil.value.id, nombre: selectedPerfil.value.nombre };
        const res = await gainAccess(payload);

        if (!res.data?.success) {
          openToast("error", res.data?.message || "No se pudo asignar el perfil", 2800);
          isLoading.value = false;
          return;
        }

        openToast("success", res.data?.message || "Perfil asignado correctamente", 1400);

        const data = res.data.data;

        if (data?.accessToken) localStorage.setItem("snai_token", data.accessToken);
        if (data?.user) {
          localStorage.setItem("snai_user", JSON.stringify(data.user));
          user.value = data.user;
        }

        if (Array.isArray(data?.permisos)) {
          localStorage.setItem("snai_permisos", JSON.stringify(data.permisos));
        }

        localStorage.setItem("snai_perfil_activo", JSON.stringify(selectedPerfil.value));
        sessionStorage.removeItem("snai_posibles_perfiles");

        setTimeout(() => {
          window.location.href = "/app";
        }, 800);
      } catch (err) {
        console.error("Error asignando perfil:", err);
        openToast("error", "Error de conexión con el servidor", 3000);
        isLoading.value = false;
      }
    };

    // ✅ Al entrar a la vista: pinta rápido + refresca real desde backend
    const boot = async () => {
      if (!ensureAuthOrRedirect()) return;
      loadFromStorage();
      await refreshPerfilesFromServer(true); // silent para no spamear toast al entrar
    };

    onMounted(boot);
    // ✅ si esta vista está dentro de KeepAlive y cambias de pestaña, esto la refresca al volver
    onActivated(boot);

    return {
      user,
      posiblesPerfiles,
      selectedPerfil,
      selectPerfil,
      asignarPerfil,
      isLoading,
      isRefreshing,
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
/* (tu CSS queda igual, lo dejo intacto para no tocar estilos) */
:global(:root) {
  --snai-navy: #0b1220;
  --snai-blue: #1e3a8a;
  --snai-blue-2: #1d4ed8;
  --snai-yellow: #fbbf24;
  --snai-red: #ef4444;

  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --bg: #f8fafc;
  --card: #ffffff;
}

.launchpad-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 34px;
  font-family: "Segoe UI", sans-serif;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 18px;
}

.greeting {
  font-size: 2rem;
  color: var(--text);
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.highlight { color: var(--snai-blue); }

.subtitle {
  color: var(--muted);
  margin: 6px 0 0 0;
  font-size: 1.02rem;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--card);
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--snai-blue) 0%, var(--snai-blue-2) 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.3px;
}

.badge-text { display: flex; flex-direction: column; gap: 4px; }
.email { font-size: 0.92rem; font-weight: 700; color: #111827; }

.verified {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  font-size: 0.74rem;
  color: #0f766e;
  background: rgba(16, 185, 129, 0.10);
  border: 1px solid rgba(16, 185, 129, 0.22);
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  font-weight: 800;
}

.divider {
  border: none;
  height: 1px;
  background: var(--border);
  margin: 18px 0 26px;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.section-title {
  font-size: 1.22rem;
  color: #111827;
  margin: 0;
  font-weight: 800;
}

.switch-btn {
  border: 1px solid var(--border);
  background: var(--card);
  color: #0f172a;
  font-weight: 800;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
}
.switch-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(30, 58, 138, 0.25);
  background: #f8fafc;
}
.switch-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
  margin-bottom: 22px;
}

.role-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}
.role-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 58, 138, 0.25);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.role-card.active {
  border-color: rgba(29, 78, 216, 0.55);
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.12);
}
.role-card.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 4px;
  border-radius: 999px;
  background: var(--snai-yellow);
}

.selection-indicator { position: absolute; top: 18px; right: 18px; }

.check-circle {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid #cbd5e1;
  transition: all 0.18s ease;
  background: transparent;
}
.role-card.active .check-circle {
  border-color: var(--snai-blue-2);
  background: var(--snai-blue-2);
  box-shadow: inset 0 0 0 4px white;
}

.icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #f1f5f9;
  color: #334155;
  margin-bottom: 14px;
  border: 1px solid #e5e7eb;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}
.role-card.active .icon-box {
  background: rgba(29, 78, 216, 0.10);
  border-color: rgba(29, 78, 216, 0.22);
  color: var(--snai-blue);
}

.role-name {
  margin: 0 0 6px 0;
  font-size: 1.12rem;
  color: #0f172a;
  font-weight: 900;
}
.role-desc {
  margin: 0;
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.5;
}

.empty-state {
  background: var(--card);
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  padding: 16px;
  color: var(--muted);
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
}

.start-btn {
  background: linear-gradient(90deg, var(--snai-blue-2) 0%, var(--snai-blue) 100%);
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 1.02rem;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  box-shadow: 0 10px 24px rgba(29, 78, 216, 0.22);
}
.start-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(29, 78, 216, 0.30);
}
.start-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.loader {
  border: 3px solid rgba(255, 255, 255, 0.35);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.toast-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 18px;
  background: rgba(2, 6, 23, 0.18);
  z-index: 9999;
}
.toast-card {
  width: min(720px, calc(100vw - 28px));
  background: var(--card);
  border-radius: 14px;
  padding: 14px 14px;
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.20);
  border: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}
.toast-left { display: flex; gap: 12px; align-items: flex-start; }

.toast-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #f1f5f9;
  font-weight: 900;
  color: #0f172a;
}
.toast-title { font-weight: 900; color: #0f172a; margin-bottom: 2px; }
.toast-message { color: #475569; font-size: 0.95rem; line-height: 1.35; }

.toast-card.success { border-color: rgba(16, 185, 129, 0.28); }
.toast-card.success .toast-icon { background: rgba(16, 185, 129, 0.12); color: #0f766e; }
.toast-card.error { border-color: rgba(239, 68, 68, 0.28); }
.toast-card.error .toast-icon { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }
.toast-card.info { border-color: rgba(29, 78, 216, 0.22); }
.toast-card.info .toast-icon { background: rgba(29, 78, 216, 0.12); color: var(--snai-blue); }

.toast-close {
  border: 1px solid var(--border);
  background: #f8fafc;
  color: #0f172a;
  font-weight: 900;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}
.toast-close:hover { transform: translateY(-1px); background: #f1f5f9; }

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .launchpad-container { padding: 22px 16px; }
  .welcome-header { flex-direction: column; align-items: flex-start; }
  .user-badge { width: 100%; justify-content: space-between; }
  .start-btn { width: 100%; justify-content: center; }
  .top-row { flex-direction: column; align-items: flex-start; }
}
</style>
