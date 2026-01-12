<template>
  <div class="page-container">
    <div class="page-header">
      <button class="btn-back" @click="goBack" title="Volver a provincias">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="title-wrap">
        <span class="eyebrow">Detalle de Provincia</span>
        <h2>{{ provinciaInfo.nombre || 'Cargando...' }}</h2>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="stat-content">
          <span class="label">ID Provincia</span>
          <strong class="value">#{{ provinciaInfo.id }}</strong>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
        </div>
        <div class="stat-content">
          <span class="label">Cantones</span>
          <strong class="value">{{ cantones.length }} registrados</strong>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="section-header">
        <h3>Listado de Cantones</h3>
        <p>Jurisdicciones asociadas a esta provincia</p>
      </div>

      <div v-if="isLoading" class="loading-state">
        <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span>Cargando datos...</span>
      </div>

      <div v-else-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <div v-else-if="cantones.length > 0" class="cantones-grid">
        <div v-for="canton in cantones" :key="canton.id" class="canton-card">
          <div class="canton-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c0-2.5 1.5-4.5 4-4.5"/><path d="M7 16.5V21"/><path d="M11 21v-3.5c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5V21"/><path d="M17 21v-1.8c0-2 1.5-3.7 3.5-3.7"/><path d="M21 21v-3.5"/><path d="M4 11V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><path d="M8 3v2"/><path d="M16 3v2"/><path d="M4 11h16"/></svg>
          </div>
          <div class="canton-info">
            <span class="canton-name">{{ canton.nombre }}</span>
            <span class="canton-meta">ID: {{ canton.id }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        <strong>Sin cantones</strong>
        <span>No hay cantones asociados a esta provincia.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCantones } from "@/service/cantones.service.js"; // Ajusta la ruta si es necesario
import { getProvincias } from "@/service/provincias.service.js";

// -- Helpers (Mantenidos de tu código original) --
const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const mapCanton = (item) => {
  const rawId = item?.id ?? item?.cantonId ?? item?.idCanton;
  const rawProvinciaId = item?.provinciaId ?? item?.idProvincia ?? item?.provincia?.id;
  return {
    id: Number.isNaN(Number(rawId)) ? rawId : Number(rawId),
    nombre: item?.nombre ?? item?.name ?? item?.canton ?? "",
    provinciaId: Number.isNaN(Number(rawProvinciaId)) ? rawProvinciaId : Number(rawProvinciaId),
    provinciaNombre: item?.provincia?.nombre ?? item?.provinciaNombre ?? "",
  };
};

// -- Setup Logic --
const route = useRoute();
const router = useRouter();

const provinciaId = computed(() => Number(route.params.id));
const provinciaNombre = ref("");
const cantones = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

const provinciaInfo = computed(() => ({
  id: provinciaId.value,
  nombre: provinciaNombre.value || (provinciaId.value ? `Provincia #${provinciaId.value}` : "")
}));

const loadProvincia = async () => {
  try {
    const res = await getProvincias();
    if (res.data?.success === false) return;
    
    const list = resolveList(res);
    const match = list.find((item) => Number(item?.id) === provinciaId.value);
    
    if (match) {
      provinciaNombre.value = match?.nombre ?? match?.name ?? match?.provincia ?? "";
    }
  } catch (err) {
    console.error("Error cargando provincia:", err);
  }
};

const loadCantones = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  
  try {
    const res = await getCantones({ provinciaId: provinciaId.value });
    
    if (res.data?.success === false) {
      errorMessage.value = res.data?.message || "No se pudo cargar cantones.";
      cantones.value = [];
      return;
    }
    
    const list = resolveList(res);
    const mapped = list.map(mapCanton).filter((item) => item.nombre);
    const idValue = Number(provinciaId.value);
    
    // Filtrado local por si la API devuelve todos
    cantones.value = mapped.filter((item) => {
      if (!idValue) return true;
      return Number(item.provinciaId) === idValue;
    });

    // Fallback para el nombre si no se cargó por getProvincias
    if (!provinciaNombre.value && cantones.value.length) {
      provinciaNombre.value = cantones.value[0].provinciaNombre;
    }
  } catch (err) {
    console.error("Error cargando cantones:", err);
    errorMessage.value = "No se pudo conectar con el servidor.";
    cantones.value = [];
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push("/app/provincias");
};

watch(provinciaId, () => {
  loadProvincia();
  loadCantones();
});

onMounted(() => {
  loadProvincia();
  loadCantones();
});
</script>

<style scoped>
/* Layout */
.page-container {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.title-wrap {
  display: flex;
  flex-direction: column;
}

.eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.title-wrap h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.blue { background: #eff6ff; color: #2563eb; }
.stat-icon.green { background: #f0fdf4; color: #16a34a; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.85rem;
  color: #64748b;
}

.value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

/* Content Section */
.content-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
}

.section-header h3 {
  margin: 0 0 4px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.section-header p {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}

/* Cantones Grid */
.cantones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.canton-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.canton-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #cbd5e1;
}

.canton-icon {
  width: 36px;
  height: 36px;
  background: #f8fafc;
  color: #64748b;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canton-info {
  display: flex;
  flex-direction: column;
}

.canton-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
}

.canton-meta {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Status States */
.loading-state, .empty, .error-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  gap: 12px;
  color: #64748b;
}

.error-banner {
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  padding: 16px;
}

.spinner {
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  color: #2563eb;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>