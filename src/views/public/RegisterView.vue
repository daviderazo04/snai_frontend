<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Crear cuenta</h1>
        <p class="subtitle">Únete a nosotros en segundos</p>
      </div>

      <form @submit.prevent="handleRegister">
        
        <div class="name-row">
          <div class="input-group">
            <span class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </span>
            <input
              v-model="form.nombre"
              type="text"
              placeholder="Nombre"
              required
              class="styled-input"
            />
          </div>
          
          <div class="input-group">
            <span class="input-icon">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </span>
            <input
              v-model="form.apellido"
              type="text"
              placeholder="Apellido"
              required
              class="styled-input"
            />
          </div>
        </div>

        <div class="input-group">
          <span class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </span>
          <input
            v-model="form.correo"
            type="email"
            placeholder="Correo electrónico"
            required
            class="styled-input"
          />
        </div>

        <div class="input-group">
          <span class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </span>
          <input
            v-model="form.password"
            type="password"
            placeholder="Contraseña"
            required
            class="styled-input"
          />
        </div>

        <button type="submit" class="submit-btn">Registrarse</button>
      </form>

      <div v-if="error" class="error-banner">
        <span>{{ error }}</span>
      </div>

      <p class="auth-footer">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="link">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { register, login, getProfile } from "../../service/auth.service.js";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const form = reactive({ nombre: "", apellido: "", correo: "", password: "" });
    const error = ref("");

    const handleRegister = async () => {
      error.value = "";
      try {
        const regRes = await register(form);
        if (!regRes.data?.success) {
          error.value = "Datos inválidos";
          return;
        }
        const loginRes = await login({ correo: form.correo, password: form.password });
        localStorage.setItem("snai_token", loginRes.data.data.accessToken);
        
        const profileRes = await getProfile();
        if (profileRes.data?.success) {
          localStorage.setItem("snai_user", JSON.stringify(profileRes.data.data));
        }
        router.push("/app/perfiles");
      } catch (err) {
        console.error(err);
        error.value = "Error al registrarse";
      }
    };
    return { form, error, handleRegister };
  },
};
</script>

<style scoped>
/* REGLA DE ORO PARA EVITAR DESCUADRES */
* {
  box-sizing: border-box;
}

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
  max-width: 450px; /* Un poco más ancho para el registro */
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

/* CONTENEDOR DE FILA PARA NOMBRE/APELLIDO */
.name-row {
  display: flex;
  gap: 15px; /* Espacio entre los dos inputs */
  margin-bottom: 0; /* Quitamos margen inferior porque los hijos ya tienen */
}

/* Hacer que los grupos de la fila ocupen espacio igual */
.name-row .input-group {
  flex: 1; /* Ocupa el 50% cada uno */
  min-width: 0; /* Evita desbordamiento en flex */
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
  pointer-events: none; /* Para que el clic pase al input */
}

.styled-input {
  width: 100%;
  padding: 12px 15px 12px 40px; /* Padding izquierdo para no tapar el icono */
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: 0.3s;
  background: #f9f9f9;
  height: 48px; /* Altura fija para alinear bien */
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

.submit-btn:hover {
  transform: scale(1.02);
}

.error-banner {
  margin-top: 15px;
  color: #d9534f;
  background: #fdeded;
  padding: 10px;
  border-radius: 5px;
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