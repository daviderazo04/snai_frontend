<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Iniciar sesión</h1>
        <p class="subtitle">Bienvenido de nuevo</p>
      </div>

      <form @submit.prevent="handleLogin">
        <!-- Input Cédula -->
        <div class="input-group">
          <span class="input-icon">
            <!-- Icono de usuario/documento (puedes dejar el de correo si quieres) -->
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>

          <input
            v-model="form.cedula"
            type="text"
            inputmode="numeric"
            pattern="[0-9]{10}"
            maxlength="10"
            placeholder="Número de cédula"
            required
            class="styled-input"
          />
        </div>

        <!-- Input Contraseña -->
        <div class="input-group">
          <span class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </span>

          <input
            v-model="form.password"
            type="password"
            placeholder="Contraseña"
            required
            class="styled-input"
          />
        </div>

        <button type="submit" class="submit-btn">Entrar</button>
      </form>

      <!-- Mensaje de Error -->
      <div v-if="error" class="error-banner">
        <span>{{ error }}</span>
      </div>

      <p class="auth-footer">
        ¿No tienes cuenta?
        <router-link to="/register" class="link">Regístrate</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { login } from "../../service/auth.service.js";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const form = reactive({ cedula: "", password: "" });
    const error = ref("");

    const handleLogin = async () => {
      error.value = "";

      try {
        // Enviar { cedula, password }
        const response = await login({
          cedula: String(form.cedula).trim(),
          password: form.password,
        });

        if (!response.data?.success) {
          error.value = response.data?.message || "Credenciales incorrectas";
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
      }
    };

    return { form, error, handleLogin };
  },
};
</script>

<style scoped>
* { box-sizing: border-box; }

.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0eafc, #cfdef3);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.auth-header h1 {
  font-size: 1.8rem;
  margin-bottom: 5px;
  color: #333;
}

.subtitle {
  color: #666;
  margin-bottom: 25px;
}

.input-group {
  position: relative;
  margin-bottom: 15px;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  display: flex;
  align-items: center;
}

.styled-input {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: 0.3s;
  background: #f9f9f9;
}

.styled-input:focus {
  border-color: #6a11cb;
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(to right, #6a11cb, #2575fc);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: transform 0.2s;
}

.submit-btn:hover { transform: scale(1.02); }

.error-banner {
  margin-top: 15px;
  color: #d9534f;
  background: #fdeded;
  padding: 10px;
  border-radius: 5px;
  font-size: 0.9rem;
}

.auth-footer {
  margin-top: 20px;
  font-size: 0.9rem;
}

.link {
  color: #2575fc;
  font-weight: bold;
  text-decoration: none;
}
</style>
