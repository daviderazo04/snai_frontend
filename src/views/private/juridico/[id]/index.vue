<template>
  <div class="detail-page">
    <button class="back" type="button" @click="goBack">
      ← Volver al listado
    </button>

    <div v-if="loading" class="status">
      <div class="spinner"></div>
      Cargando expediente jurídico...
    </div>

    <div v-else-if="!data" class="status error">
      No se pudo cargar la información del registro #{{ $route.params.id }}
      <button class="retry-btn" @click="loadData">Reintentar</button>
    </div>

    <template v-else>
      
      <section class="detail-hero">
        <div class="hero-content">
          <p class="eyebrow">Expediente Jurídico Completo</p>
          <h1>Causa N° {{ data.numeroCausa }}</h1>
          <p class="subtitle">
            {{ data.adolescente?.nombre }} {{ data.adolescente?.apellido }} — {{ data.delito?.nombre || 'Delito no especificado' }}
          </p>
        </div>

        <div class="hero-cards">
          <div class="info-card">
            <span class="label">ID Sistema</span>
            <strong>#{{ data.id }}</strong>
          </div>
          <div class="info-card">
            <span class="label">Cédula</span>
            <strong>{{ data.adolescente?.cedula || 'S/N' }}</strong>
          </div>
          <div class="info-card highlight">
            <span class="label">Fin de Condena 🔒</span>
            <strong>{{ formatDate(data.fechaFin) }}</strong>
          </div>
        </div>
      </section>

      <section class="detail-body">
        <div class="summary">
          
          <div class="summary-item">
            <span class="summary-label">Juez de la Causa</span>
            <strong>{{ data.juez || '—' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Fiscal Asignado</span>
            <strong>{{ data.fiscal || '—' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Defensor Público/Privado</span>
            <strong>{{ data.defensor || '—' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Boleta de Preventivo</span>
            <strong>{{ data.boletaPreventivo || '—' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Boleta de Cárcel</span>
            <strong>{{ data.boletaCarcel || '—' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Medidas Impuestas</span>
            <strong>{{ data.medidas || 'Sin medidas adicionales' }}</strong>
          </div>

          <div class="summary-item accent-blue">
            <span class="summary-label">Tiempo Total Sentencia</span>
            <strong>{{ data.tiempoAnio }} años, {{ data.tiempoMes }} meses, {{ data.sentenciaDia }} días</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Fecha de Inicio</span>
            <strong>{{ formatDate(data.fechaInicio) }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Fecha de Audiencia</span>
            <strong>{{ formatDate(data.fechaAudiencia) }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Fecha de Sentencia</span>
            <strong>{{ formatDate(data.fechaSentencia) }}</strong>
          </div>

          <div class="summary-item accent-gold">
            <span class="summary-label">Cómputo al 60%</span>
            <strong>{{ formatDate(data.fecha60) }}</strong>
          </div>

          <div class="summary-item accent-gold">
            <span class="summary-label">Cómputo al 80%</span>
            <strong>{{ formatDate(data.fecha80) }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Recurso de Apelación</span>
            <strong>{{ data.recApelMod || 'No presentado' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Fecha de Apelación</span>
            <strong>{{ formatDate(data.RecApelFecha) }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Recurso de Casación</span>
            <strong>{{ data.casacionRecurso === 's' ? 'PRESENTADO' : 'NO' }}</strong>
          </div>

          <div class="summary-item">
            <span class="summary-label">Fecha de Casación</span>
            <strong>{{ formatDate(data.casacionFecha) }}</strong>
          </div>

          <div v-if="data.egresoFecha" class="summary-item full-width accent-orange">
            <span class="summary-label">Información de Egreso Real</span>
            <div class="egreso-content">
                <strong>Fecha: {{ formatDate(data.egresoFecha) }}</strong>
                <p class="text-content"><strong>Motivo:</strong> {{ data.egresoMotivo || 'No especificado' }}</p>
            </div>
          </div>
          
          <div v-else class="summary-item full-width">
            <span class="summary-label">Observaciones Adicionales</span>
            <p class="text-content">
              {{ data.egresoMotivo || 'Sin observaciones registradas en este expediente.' }}
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
import { getJuridico } from "@/service/juridico.service";

const route = useRoute();
const router = useRouter();

const data = ref(null);
const loading = ref(true);

const loadData = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const res = await getJuridico(id);
    if (res.data && res.data.success) {
      data.value = res.data.data;
    }
  } catch (err) {
    console.error("Error al cargar detalle jurídico:", err);
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.push({ name: 'juridico' });

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("es-EC", { year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.back {
  align-self: flex-start;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 18px;
  cursor: pointer;
  color: #1e293b;
  font-weight: 700;
  transition: all 0.2s ease;
}
.back:hover { background: #f1f5f9; transform: translateX(-4px); }

/* HERO */
.detail-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%);
  color: white;
  border-radius: 24px;
  padding: 35px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.hero-content h1 { margin: 8px 0; font-size: 2.4rem; font-weight: 900; }
.eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 0.75rem; color: rgba(255, 255, 255, 0.6); font-weight: 800; }
.subtitle { margin: 0; font-size: 1.1rem; color: rgba(255, 255, 255, 0.9); }

/* HERO CARDS */
.hero-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; flex: 1; }
.info-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.info-card.highlight { background: rgba(251, 191, 36, 0.15); border-color: rgba(251, 191, 36, 0.3); }
.label { font-size: 0.7rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.5); font-weight: 800; }

/* BODY */
.detail-body {
  background: white;
  border-radius: 28px;
  padding: 35px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
}
.summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.summary-item {
  background: #f8fafc;
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.summary-item:hover { border-color: #3b82f6; background: white; transform: translateY(-2px); }

.summary-item.accent-blue { border-left: 5px solid #3b82f6; background: #eff6ff; }
.summary-item.accent-gold { border-left: 5px solid #fbbf24; background: #fffbeb; }
.summary-item.accent-orange { border-left: 5px solid #f97316; background: #fff7ed; }
.summary-item.full-width { grid-column: 1 / -1; }

.summary-label { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px; }
.summary-item strong { color: #0f172a; font-size: 1.15rem; }
.text-content { margin: 8px 0 0; color: #475569; line-height: 1.6; }

/* LOADER */
.status { padding: 80px; text-align: center; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 850px) {
  .detail-hero { padding: 25px; }
  .hero-content h1 { font-size: 1.8rem; }
  .summary { grid-template-columns: 1fr; }
}
</style>