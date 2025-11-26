<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1>Sistema de Fichas de Intervención</h1>
      <p class="subtitle">
        Seleccione el módulo que desea gestionar
      </p>
    </div>

    <div class="cards-container">
      <div class="card" @click="go('familiar')">
        <h3>Ficha de Intervención Familiar</h3>
        <p>Registro y seguimiento de intervenciones con entorno familiar.</p>
      </div>

      <div class="card" @click="go('terapeutica')">
        <h3>Ficha de Intervención Terapéutica</h3>
        <p>Control de intervenciones psicológicas y tratamiento.</p>
      </div>

      <div class="card" @click="go('ocupacional')">
        <h3>Ficha de Intervención Ocupacional</h3>
        <p>Gestión del trabajo, talleres y actividades ocupacionales.</p>
      </div>

      <div class="card" @click="go('juridica')">
        <h3>Ficha de Informe Jurídico</h3>
        <p>Elaboración de reportes legales y documentación jurídica.</p>
      </div>

      <div class="card" @click="go('traslado')">
        <h3>Solicitud de Traslado</h3>
        <p>Formulario para gestionar traslados institucionales.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const go = (name) => router.push(`/form/${name}`);
    return { go };
  },
};
</script>

<style scoped>
/* Fondo general del dashboard */
.dashboard-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #e3e9ff, #f4f7ff);
  text-align: center;
}

/* Header */
.dashboard-header h1 {
  font-size: 2rem;
  color: #2b2b2b;
  margin-bottom: 8px;
}

.dashboard-header .subtitle {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 30px;
}

/* Contenedor de tarjetas */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 25px;
  max-width: 1100px;
  margin: 0 auto;
}

/* Tarjetas */
.card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e5e5;
  cursor: pointer;
  transition: 0.3s ease;
  text-align: left;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-color: #3454d1;
}

.card h3 {
  color: #3454d1;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.card p {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
}
</style>
