<template>
  <div class="detail-page">
    <button class="back" type="button" @click="goBack">
      Volver al listado
    </button>

    <div v-if="isLoading" class="status">
      Cargando expediente...
    </div>

    <div v-else-if="errorMessage" class="status error">
      {{ errorMessage }}
      <button class="retry-btn" @click="loadData">Reintentar</button>
    </div>

    <template v-else-if="item">
      
      <section class="detail-hero">
        <div class="hero-content">
          <p class="eyebrow">Expediente de Adolescente</p>
          <h1>{{ item.nombre }} {{ item.apellido }}</h1>
          <p class="subtitle">
            {{ item.cai?.nombre || 'Sin Centro Asignado' }} - {{ item.canton?.nombre || 'Ubicación desconocida' }}
          </p>
        </div>

        <div class="hero-cards">
          <div class="info-card">
            <span class="label">ID Sistema</span>
            <strong>#{{ item.id }}</strong>
          </div>
          <div class="info-card">
            <span class="label">Cédula</span>
            <strong>{{ item.cedula || 'S/N' }}</strong>
          </div>
          <div class="info-card">
            <span class="label">Edad Aprox.</span>
            <strong>{{ calculateAge(item.fecha_nac) }} años</strong>
          </div>
        </div>
      </section>

      <section class="detail-body">
        <div class="summary">
          
          <div class="summary-item">
            <span class="summary-label">Fecha de Nacimiento</span>
            <strong>{{ formatDate(item.fecha_nac) }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Fecha de Ingreso</span>
            <strong>{{ formatDate(item.fecha_ingr) }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Nacionalidad</span>
            <strong>{{ item.nacionalidad?.nombre || '-' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Etnia</span>
            <strong>{{ item.etnia?.nombre || '-' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Estado Civil</span>
            <strong>{{ item.estadoCivil?.nombre || '-' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Hijos</span>
            <strong>{{ item.hijos }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Padre PPL</span>
            <strong>{{ isTrue(item.hijoPpl) ? 'Sí' : 'No' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Reincidente</span>
            <strong>{{ isTrue(item.reincide) ? 'Sí' : 'No' }}</strong>
          </div>

          <div class="summary-item full-width">
            <span class="summary-label">Observaciones</span>
            <p class="text-content">
              {{ item.observaciones || 'No hay observaciones registradas.' }}
            </p>
          </div>

        </div>
      </section>

    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
// Importamos el servicio correcto
import { getAdolescentes } from "../../../../service/adolescente.service.js";

const route = useRoute();
const router = useRouter();

const item = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

// Función para extraer datos del backend de forma segura
const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const loadData = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const idParam = String(route.params.id);

    // FIX: Pedimos una lista grande para asegurar que el ID venga incluido 
    // (ya que el backend parece paginar por defecto)
    const res = await getAdolescentes({ size: 1000, limit: 1000 });
    
    const list = resolveList(res);
    
    // Buscamos manualmente el ID en la lista devuelta
    const found = list.find(a => String(a.id) === idParam);

    if (found) {
      item.value = found;
    } else {
      errorMessage.value = "No se encontró el adolescente solicitado.";
    }

  } catch (err) {
    console.error("Error cargando detalle:", err);
    errorMessage.value = "Error de conexión con el servidor.";
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  // Asegúrate de que en router.js la ruta del listado tenga name: 'adolescentes'
  router.push({ name: 'adolescentes' });
};

// --- Helpers de Formato ---
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("es-EC", { year: 'numeric', month: 'long', day: 'numeric' });
};

const calculateAge = (dateString) => {
  if (!dateString) return "-";
  const today = new Date();
  const birthDate = new Date(dateString);
  if (isNaN(birthDate.getTime())) return "-";
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const isTrue = (val) => {
  return val === true || val === "1" || val === 1 || val === "true";
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* =========================================
   ESTILOS COPIADOS Y ADAPTADOS DE TU REFERENCIA
   ========================================= */

.detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1000px; /* Limitamos ancho para que se vea bien */
  margin: 0 auto;
  width: 100%;
}

.back {
  align-self: flex-start;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  color: #1e293b;
  transition: background 0.2s ease, transform 0.1s;
  font-weight: 600;
  font-size: 0.9rem;
}

.back:hover {
  background: #f1f5f9;
  transform: translateX(-2px);
}

/* HERO SECTION */
.detail-hero {
  /* Gradiente Azul similar al de CAI */
  background: linear-gradient(130deg, #1e293b 0%, #0f172a 40%, #0ea5e9 100%);
  color: white;
  border-radius: 20px;
  padding: 26px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.hero-content {
  max-width: 500px;
}

.hero-content h1 {
  margin: 6px 0 10px;
  font-size: 1.8rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

/* HERO CARDS (Tarjetas traslúcidas arriba) */
.hero-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  flex: 1;
}

.info-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-card strong {
  font-size: 1.1rem;
}

.label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
}

/* BODY SECTION */
.detail-body {
  background: white;
  border-radius: 18px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background 0.2s;
}

.summary-item:hover {
  background: #f1f5f9;
}

.summary-item.full-width {
  grid-column: 1 / -1; /* Ocupa todo el ancho */
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  font-weight: 600;
}

.summary-item strong {
  color: #0f172a;
  font-size: 1rem;
}

.text-content {
  margin: 0;
  color: #334155;
  line-height: 1.5;
  font-size: 0.95rem;
}

/* ESTADOS */
.status {
  padding: 20px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.92rem;
  text-align: center;
  margin-top: 20px;
}

.status.error {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.retry-btn {
  background: white;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 700px) {
  .detail-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-cards {
    width: 100%;
  }
}
</style>