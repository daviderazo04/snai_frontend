<template>
  <div class="detail-page">
    <button class="back" type="button" @click="goBack">
      Volver a cantones
    </button>

    <section class="detail-hero">
      <div class="hero-content">
        <p class="eyebrow">Canton</p>
        <h1>{{ cantonNombre }}</h1>
        <p class="subtitle">Detalle operativo del canton seleccionado.</p>
      </div>
      <div class="hero-cards">
        <div class="info-card">
          <span class="label">ID</span>
          <strong>#{{ cantonId }}</strong>
        </div>
        <div class="info-card">
          <span class="label">Provincia</span>
          <strong>{{ provinciaLabel }}</strong>
        </div>
      </div>
    </section>

    <section class="detail-body">
      <div v-if="isLoading" class="status">Cargando canton...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
      <div v-else class="summary">
        <div class="summary-item">
          <span class="summary-label">Nombre</span>
          <strong>{{ cantonNombre }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">ID canton</span>
          <strong>{{ cantonId }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">Provincia</span>
          <strong>{{ provinciaLabel }}</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCantones } from "../../../../service/cantones.service.js";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.cantones)) return payload.cantones;
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

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const cantonId = computed(() => Number(route.params.id));

    const canton = ref(null);
    const isLoading = ref(false);
    const errorMessage = ref("");

    const cantonNombre = computed(() => {
      if (canton.value?.nombre) return canton.value.nombre;
      return cantonId.value ? `Canton #${cantonId.value}` : "Canton";
    });

    const provinciaLabel = computed(() => {
      if (!canton.value) return "-";
      return canton.value.provinciaNombre
        ? canton.value.provinciaNombre
        : canton.value.provinciaId || "-";
    });

    const loadCanton = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const res = await getCantones();
        if (res.data?.success === false) {
          errorMessage.value = res.data?.message || "No se pudo cargar el canton.";
          canton.value = null;
          return;
        }
        const list = resolveList(res);
        const mapped = list.map(mapCanton);
        canton.value = mapped.find((item) => Number(item.id) === cantonId.value) || null;
        if (!canton.value) {
          errorMessage.value = "Canton no encontrado.";
        }
      } catch (err) {
        console.error("Error cargando canton:", err);
        errorMessage.value = "Error de conexion con el servidor.";
        canton.value = null;
      } finally {
        isLoading.value = false;
      }
    };

    const goBack = () => {
      router.push("/app/cantones");
    };

    onMounted(loadCanton);

    return {
      cantonId,
      cantonNombre,
      provinciaLabel,
      isLoading,
      errorMessage,
      goBack,
    };
  },
};
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.back {
  align-self: flex-start;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  color: #1e293b;
  transition: background 0.2s ease;
}

.back:hover {
  background: #f1f5f9;
}

.detail-hero {
  background: linear-gradient(130deg, #1e293b, #0ea5e9);
  color: white;
  border-radius: 20px;
  padding: 26px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.2);
}

.hero-content h1 {
  margin: 6px 0 10px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
}

.subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

.hero-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.info-card {
  background: rgba(255, 255, 255, 0.12);
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

.detail-body {
  background: white;
  border-radius: 18px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.summary-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
}

.status {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.92rem;
}

.status.error {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}
</style>
