<template>
  <div class="auth-page">
    <div class="auth-card">
      
      <div class="auth-header">
        <div class="logo-container">
          <img :src="logo" alt="SNAI" class="brand-logo" />
        </div>
        
        <h1>Iniciar sesión</h1>
        <p class="subtitle">Bienvenido al sistema de jóvenes adolescentes privados de la libertad</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <span class="input-icon left">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>
          <input
            v-model="form.cedula"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="10"
            placeholder="Número de cédula"
            required
            class="styled-input"
          />
        </div>

        <div class="input-group">
          <span class="input-icon left">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </span>
          
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Contraseña"
            required
            class="styled-input with-toggle"
          />

          <button 
            type="button" 
            class="password-toggle" 
            @click="showPassword = !showPassword"
            :title="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
          >
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 9-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? "Validando..." : "Acceder" }}
        </button>
      </form>

      <transition name="fade">
        <div v-if="error" class="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>{{ error }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { login } from "../../service/auth.service.js";
import logoImg from "@/assets/snai.png"; 

const router = useRouter();
const logo = logoImg;

const form = reactive({ cedula: "", password: "" });
const error = ref("");
const loading = ref(false);
const showPassword = ref(false); // Estado para controlar visibilidad

const handleLogin = async () => {
  error.value = "";
  loading.value = true;

  try {
    const response = await login({
      cedula: String(form.cedula).trim(),
      password: form.password,
    });

    if (!response.data?.success) {
      error.value = response.data?.message || "Credenciales incorrectas";
      loading.value = false;
      return;
    }

    const { accessToken, user, posiblesPerfiles } = response.data.data;

    localStorage.setItem("snai_token", accessToken);
    localStorage.setItem("snai_user", JSON.stringify(user));
    sessionStorage.setItem("snai_posibles_perfiles", JSON.stringify(posiblesPerfiles));

    router.push("/app/perfiles");
  } catch (err) {
    console.error(err);
    error.value = "Error de conexión con el servidor";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* RESET GLOBAL */
:global(body), :global(html) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

* { box-sizing: border-box; }

.auth-page {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden;
}

.auth-page::before {
  content: "";
  position: absolute;
  top: -100px;
  right: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(0,0,0,0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.auth-card {
  background: white;
  padding: 3.5rem 3rem;
  width: 100%;
  max-width: 520px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 24px;
  z-index: 10;
  position: relative;
}

.auth-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.brand-logo {
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.auth-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
  max-width: 90%;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-group {
  position: relative;
  width: 100%;
}

/* Icono Izquierdo (Estático) */
.input-icon.left {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  pointer-events: none; /* Evita que el click interfiera */
}

/* Botón Toggle (Derecho) */
.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #2563eb;
}

.styled-input {
  width: 100%;
  padding: 14px 16px 14px 48px; /* Espacio izquierda para icono */
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  color: #0f172a;
  transition: all 0.2s ease;
}

/* Padding extra a la derecha para el input de password (para el ojo) */
.styled-input.with-toggle {
  padding-right: 48px;
}

.styled-input::placeholder {
  color: #cbd5e1;
}

.styled-input:focus {
  background: white;
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.input-group:focus-within .input-icon {
  color: #2563eb;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  margin-top: 10px;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  color: #dc2626;
  padding: 14px;
  border-radius: 10px;
  font-size: 0.95rem;
  border: 1px solid #fecaca;
  margin-top: 5px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 540px) {
  .auth-card {
    padding: 2rem;
    max-width: 100%;
  }
  .auth-header h1 {
    font-size: 1.5rem;
  }
}
</style>