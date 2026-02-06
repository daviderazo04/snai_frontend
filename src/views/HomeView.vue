<template>
  <div class="home-page">
    <div class="hero-card">
      
      <div class="logo-wrapper">
        <img :src="logo" alt="SNAI" class="brand-logo" />
      </div>

      <div class="content">
        <h1>Sistema de <span class="highlight">Jóvenes Privados de la libertad</span></h1>
        
        <p class="description">
          Plataforma integral para la gestión, monitoreo y control de información de adolescentes infractores y personas privadas de libertad.
        </p>

        <div class="actions">
          <button class="btn btn-primary" @click="goLogin">
            Ingresar al Sistema
          </button>
        </div>
      </div>

      <div class="footer-note">
        <p>© 2026 Servicio Nacional de Atención Integral</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import logoImg from "@/assets/snai.png"; 

const router = useRouter();
const logo = logoImg;

const goLogin = () => {
  router.push({ name: "login" });
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

/* CONTENEDOR PRINCIPAL */
.home-page {
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

/* Decoración de fondo */
.home-page::before {
  content: "";
  position: absolute;
  bottom: -150px;
  left: -100px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(0,0,0,0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* TARJETA PRINCIPAL */
.hero-card {
  background: white;
  width: 100%;
  max-width: 540px; /* Tarjeta un poco más ancha para dar aire */
  padding: 3.5rem 3rem;
  border-radius: 24px;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.4);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  
  /* Animación */
  animation: slideUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

/* LOGO */
.logo-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

/* --- LOGO AJUSTADO --- */
.brand-logo {
  width: 100%;
  max-width: 450px; /* Aumentado considerablemente para legibilidad */
  height: auto;
  object-fit: contain;
}

/* TIPOGRAFÍA */
h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(120deg, #2563eb, #1d4ed8);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #2563eb;
}

.description {
  font-size: 1.05rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0 auto 24px;
}

/* BOTONES */
.actions {
  display: flex;
  width: 100%;
  justify-content: center;
}

.btn {
  width: 100%;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.35);
}

/* FOOTER */
.footer-note {
  margin-top: 10px;
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
  width: 100%;
}

.footer-note p {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

/* ANIMACIÓN */
@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RESPONSIVE */
@media (max-width: 500px) {
  .hero-card {
    padding: 2.5rem 1.5rem;
  }
  
  h1 {
    font-size: 1.8rem;
  }
}
</style>