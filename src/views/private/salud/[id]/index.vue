<template>
  <div class="detail-page">
    <button class="back" type="button" @click="goBack">
      Volver al listado
    </button>

    <div v-if="isLoading" class="status">
      Cargando ficha médica...
    </div>

    <div v-else-if="errorMessage" class="status error">
      {{ errorMessage }}
      <button class="retry-btn" @click="loadData">Reintentar</button>
    </div>

    <template v-else-if="item">
      
      <section class="detail-hero">
        <div class="hero-content">
          <p class="eyebrow">Ficha de Salud #{{ item.id }}</p>
          <h1>{{ item.adolescenteNombre }}</h1>
          <p class="subtitle">
            Fecha de registro: {{ formatDate(item.fecha) }}
          </p>
        </div>

        <div class="hero-cards">
          <div class="info-card" :class="{ 'active-alert': isTrue(item.discapacidad) }">
            <span class="label">Discapacidad</span>
            <strong>{{ isTrue(item.discapacidad) ? 'Registrada' : 'No' }}</strong>
          </div>
          
          <div class="info-card" :class="{ 'active-info': isTrue(item.tomaMedicacion) }">
            <span class="label">Medicación</span>
            <strong>{{ isTrue(item.tomaMedicacion) ? 'Sí' : 'No' }}</strong>
          </div>
          
          <div class="info-card" :class="{ 'active-warn': isTrue(item.consumeSustancia) }">
            <span class="label">Sustancias</span>
            <strong>{{ isTrue(item.consumeSustancia) ? 'Sí' : 'No' }}</strong>
          </div>
        </div>
      </section>

      <section class="detail-body">
        <div class="info-grid">
          
          <div class="card full-width">
            <h3 class="card-title">Diagnóstico Médico</h3>
            <div class="card-body">
              <p class="text-block highlight">
                {{ item.diagnostico || 'Sin diagnóstico registrado.' }}
              </p>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title">Detalles de Atención</h3>
            <div class="card-body">
              <div class="info-row">
                <span class="label">N° Atenciones</span>
                <span class="value">{{ item.numAtenMedica }}</span>
              </div>
              <div class="info-row">
                <span class="label">ID Adolescente</span>
                <span class="value">#{{ item.adolescenteId }}</span>
              </div>
              <div class="info-row">
                <span class="label">Fecha Atención</span>
                <span class="value">{{ formatDate(item.fecha) }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title">Detalles de Tratamiento</h3>
            <div class="card-body">
              <div class="info-row">
                <span class="label">Toma Medicación</span>
                <span class="value">
                   <span :class="['status-dot', isTrue(item.tomaMedicacion) ? 'blue' : 'grey']"></span>
                   {{ isTrue(item.tomaMedicacion) ? 'Sí' : 'No' }}
                </span>
              </div>
              
              <div class="info-row">
                <span class="label">Consume Sustancias</span>
                <span class="value">
                  <span :class="['status-dot', isTrue(item.consumeSustancia) ? 'red' : 'green']"></span>
                  {{ isTrue(item.consumeSustancia) ? 'Sí' : 'No' }}
                </span>
              </div>

              <div class="info-row" v-if="isTrue(item.consumeSustancia)">
                <span class="label">Tipo Sustancia</span>
                <span class="value danger">{{ item.tipoSustancia || 'No especificado' }}</span>
              </div>
            </div>
          </div>

          <div class="card full-width">
            <h3 class="card-title">Observaciones</h3>
            <div class="card-body">
              <p class="text-block">
                {{ item.observacion || 'No hay observaciones adicionales registradas.' }}
              </p>
            </div>
          </div>

        </div>
      </section>

    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSalud } from "@/service/salud.service.js"; // Ajusta la ruta si es necesario

const route = useRoute();
const router = useRouter();

const item = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

// --- Helpers de Datos ---
const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalize01 = (v) => {
  const s = v === 1 || v === true ? "1" : v === 0 || v === false ? "0" : String(v ?? "");
  return s === "1" || s === "0" ? s : "0";
};

const mapItem = (row) => {
  const rawId = row?.id ?? row?.saludId;
  const adolescenteId = row?.adolescente?.id ?? row?.adolescenteId ?? 0;
  
  // Intentamos obtener el nombre del objeto anidado si existe
  const nombreAdol = row?.adolescente?.nombres 
    ? `${row.adolescente.nombres} ${row.adolescente.apellidos || ''}` 
    : `Adolescente #${adolescenteId}`;

  return {
    id: Number(rawId),
    adolescenteId: Number(adolescenteId),
    adolescenteNombre: nombreAdol,
    fecha: row?.fecha ?? "",
    diagnostico: row?.diagnostico ?? "",
    tomaMedicacion: normalize01(row?.tomaMedicacion),
    consumeSustancia: normalize01(row?.consumeSustancia),
    tipoSustancia: row?.tipoSustancia ?? "",
    numAtenMedica: Number(row?.numAtenMedica ?? 0),
    discapacidad: normalize01(row?.discapacidad),
    observacion: row?.observacion ?? "",
  };
};

// --- Carga de Datos ---
const loadData = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const idParam = String(route.params.id);
    
    // Pedimos lista grande para asegurar encontrar el ID
    const res = await getSalud({ size: 1000, limit: 1000 });
    const list = resolveList(res).map(mapItem);
    
    const found = list.find(x => String(x.id) === idParam);

    if (found) {
      item.value = found;
    } else {
      errorMessage.value = "No se encontró el registro de salud solicitado.";
    }
  } catch (err) {
    console.error("Error cargando detalle:", err);
    errorMessage.value = "Error de conexión con el servidor.";
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  // Asumiendo que la ruta del listado se llama 'salud'
  // Si no tienes nombre, usa router.push('/app/salud')
  router.push({ name: 'salud' });
};

// --- Formatters ---
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("es-EC", { year: 'numeric', month: 'long', day: 'numeric' });
};

const isTrue = (val) => val === "1";

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* =========================================
   ESTILOS UNIFICADOS (Estilo Adolescente/CAI)
   ========================================= */

.detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1000px;
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
  /* Gradiente Azul Oscuro/Profesional */
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
  font-weight: 700;
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

/* HERO CARDS */
.hero-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  flex: 1;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background 0.3s ease;
}

/* Variaciones visuales si está activo */
.info-card.active-alert {
  background: rgba(251, 146, 60, 0.2); /* Naranja suave */
  border-color: rgba(251, 146, 60, 0.3);
}
.info-card.active-info {
  background: rgba(56, 189, 248, 0.2); /* Azul suave */
  border-color: rgba(56, 189, 248, 0.3);
}
.info-card.active-warn {
  background: rgba(248, 113, 113, 0.2); /* Rojo suave */
  border-color: rgba(248, 113, 113, 0.3);
}

.info-card strong {
  font-size: 1.1rem;
}

.label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.8);
}


.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.full-width {
  grid-column: 1 / -1;
}

.card-title {
  margin: 0;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 8px;
}
.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row .label {
  color: #64748b;
  font-size: 0.9rem;
  text-transform: none; /* Reset del uppercase global */
  letter-spacing: normal;
}

.info-row .value {
  color: #0f172a;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 6px;
}

.value.danger { color: #b91c1c; }

.text-block {
  margin: 0;
  color: #334155;
  line-height: 1.6;
  font-size: 0.95rem;
}
.text-block.highlight {
  font-size: 1.05rem;
  color: #0f172a;
  font-weight: 500;
}

/* Status Dots */
.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.status-dot.green { background: #22c55e; }
.status-dot.red { background: #ef4444; }
.status-dot.blue { background: #3b82f6; }
.status-dot.grey { background: #94a3b8; }

/* Estados Generales */
.status {
  padding: 40px;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
  text-align: center;
  border: 1px dashed #cbd5e1;
}

.status.error {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fca5a5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.retry-btn {
  background: white;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.retry-btn:hover { background: #fef2f2; }

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