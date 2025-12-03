<template>
  <div class="home-container">
    <div class="hero-card">
      
      <div class="icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="M12 8v4"></path>
          <path d="M12 16h.01"></path>
        </svg>
      </div>

      <h1>Sistema de Control <span class="highlight">SNAI</span></h1>

      <p class="description">
        Plataforma integral para el registro, gestión y consulta de información de personas privadas de libertad.
      </p>

      <div class="buttons-group">
        <button class="btn btn-primary" @click="goLogin">
          Iniciar sesión
        </button>
        <button class="btn btn-secondary" @click="goRegister">
          Crear cuenta
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const goLogin = () => router.push({ name: "login" }); // Asegúrate que tu ruta se llame 'login'
    const goRegister = () => router.push({ name: "register" }); // Asegúrate que tu ruta se llame 'register'

    return { goLogin, goRegister };
  },
};
</script>

<style scoped>
/* Reset básico para evitar problemas */
* {
  box-sizing: border-box;
}

.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* Mismo fondo que Login/Register para consistencia */
  background: linear-gradient(135deg, #e0eafc, #cfdef3);
  padding: 20px;
}

.hero-card {
  background: white;
  padding: 3rem 2rem;
  max-width: 550px;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  text-align: center;
  
  /* Animación de entrada */
  animation: fadeUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

/* Icono decorativo */
.icon-wrapper {
  width: 80px;
  height: 80px;
  background: #f0f4ff;
  color: #2575fc;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px auto;
  box-shadow: 0 4px 10px rgba(37, 117, 252, 0.15);
}

/* Tipografía */
h1 {
  font-size: 2rem;
  color: #1a202c;
  margin-bottom: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.highlight {
  color: #2575fc; /* Color acento */
}

.description {
  color: #718096;
  margin-bottom: 35px;
  font-size: 1.1rem;
  line-height: 1.6;
  padding: 0 10px;
}

/* Botones */
.buttons-group {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn {
  padding: 14px 28px;
  font-size: 1rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

/* Botón Principal (Login) */
.btn-primary {
  background: linear-gradient(to right, #6a11cb, #2575fc);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(37, 117, 252, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 117, 252, 0.4);
}

/* Botón Secundario (Registro) */
.btn-secondary {
  background: transparent;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
  color: #2d3748;
}

/* Animación */
@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive: En móviles los botones se apilan */
@media (max-width: 480px) {
  .buttons-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>