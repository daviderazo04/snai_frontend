<template>
  <div class="home">
    <div class="card">
      <h1>Sistema de Control de Infractores del SNAI</h1>

      <p>
        Accede para registrar, gestionar y consultar información de personas privadas de libertad.
      </p>

      <div class="buttons">
        <button class="login" @click="goLogin">Iniciar sesión</button>
        <button class="register" @click="goRegister">Registrarse</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const goLogin = () => router.push({ name: "login" });
    const goRegister = () => router.push({ name: "register" });

    return { goLogin, goRegister };
  },
};
</script>

<style scoped>
/* Fondo suave */
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e3e9ff, #f4f7ff);
  padding: 20px;
}

/* Tarjeta */
.card {
  background: white;
  padding: 40px 30px;
  max-width: 500px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Título */
h1 {
  font-size: 1.8rem;
  color: #2b2b2b;
  margin-bottom: 10px;
}

/* Texto */
p {
  color: #555;
  margin-bottom: 25px;
  font-size: 1rem;
}

/* Contenedor de botones */
.buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* Estilos base de botones */
button {
  padding: 12px 25px;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: 0.25s ease;
}

/* Botón login */
.login {
  background: #3454d1;
  color: white;
}

.login:hover {
  background: #233a92;
}

/* Botón registro */
.register {
  background: #4caf50;
  color: white;
}

.register:hover {
  background: #3a8a3e;
}
</style>
