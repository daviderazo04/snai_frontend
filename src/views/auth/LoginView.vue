<template>
  <div class="login-page">
    <div class="card">
      <h1>Iniciar sesión</h1>

      <form @submit.prevent="handleLogin">
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

        <button type="submit">Entrar</button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <p class="register-link">
        ¿No tienes cuenta?
        <router-link to="/register">Registrarse</router-link>
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
      correo: "",
      password: "",
    });

    const error = ref("");

    const handleLogin = async () => {
      error.value = "";

      try {
        const res = await AuthService.login(form);

        if (!res.success) {
          error.value = "Credenciales incorrectas";
          return;
        }

        localStorage.setItem("token", res.data.accessToken);
        router.push("/");
      } catch (err) {
        error.value = "Error en la comunicación con el servidor";
      }
    };

    return { form, error, handleLogin };
  },
};
</script>

<style scoped>
/* Fondo igual al Home */
.login-page {
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
  max-width: 420px;
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
  font-size: 1rem;
  transition: 0.25s;
}

input:focus {
  border-color: #3454d1;
  outline: none;
  box-shadow: 0 0 4px rgba(52, 84, 209, 0.3);
}

/* Botón */
button {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background: #3454d1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.25s;
}

button:hover {
  background: #233a92;
}

/* Error */
.error {
  margin-top: 12px;
  color: #d9534f;
  font-weight: 600;
}

/* Link de registro */
.register-link {
  margin-top: 15px;
  font-size: 0.95rem;
}

.register-link a {
  color: #3454d1;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
