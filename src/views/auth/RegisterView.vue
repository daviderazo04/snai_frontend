<template>
  <div class="register-page">
    <div class="card">
      <h1>Crear cuenta</h1>

      <form @submit.prevent="handleRegister">
        <input
          v-model="form.nombre"
          type="text"
          placeholder="Nombre"
          required
        />

        <input
          v-model="form.apellido"
          type="text"
          placeholder="Apellido"
          required
        />

        <input
          v-model="form.correo"
          type="email"
          placeholder="Correo"
          required
        />

        <input
          v-model="form.password"
          type="password"
          placeholder="Contraseña"
          required
        />

        <button type="submit">Crear cuenta</button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <p class="login-link">
        ¿Ya tienes una cuenta?
        <router-link to="/login">Iniciar sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { AuthService } from "../../services/auth/auth.services.js";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const form = reactive({
      nombre: "",
      apellido: "",
      correo: "",
      password: "",
    });

    const error = ref("");

    const handleRegister = async () => {
      error.value = "";

      try {
        const res = await AuthService.register(form);

        if (!res.success) {
          error.value = "El usuario ya existe o los datos son inválidos";
          return;
        }

        localStorage.setItem("token", res.data.accessToken);
        router.push("/");
      } catch (err) {
        error.value = "Error en la comunicación con el servidor";
      }
    };

    return { form, error, handleRegister };
  },
};
</script>

<style scoped>
/* Background igual al login */
.register-page {
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
  width: 100%;
  max-width: 430px;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Título */
h1 {
  font-size: 1.6rem;
  margin-bottom: 20px;
  color: #2b2b2b;
}

/* Inputs */
input {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
  transition: 0.25s ease;
  font-size: 1rem;
}

input:focus {
  border-color: #3454d1;
  outline: none;
  box-shadow: 0 0 4px rgba(52, 84, 209, 0.3);
}

/* Botón Register (verde) */
button {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.25s ease;
}

button:hover {
  background: #3a8a3e;
}

/* Error */
.error {
  margin-top: 12px;
  color: #d9534f;
  font-weight: 600;
}

/* Link de login */
.login-link {
  margin-top: 15px;
  font-size: 0.95rem;
}

.login-link a {
  color: #3454d1;
  font-weight: bold;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
