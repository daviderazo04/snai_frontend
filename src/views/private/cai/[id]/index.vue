<template>
  <div class="detail-page">
    <button class="back" type="button" @click="goBack">
      Volver a CAI
    </button>

    <section class="detail-hero">
      <div class="hero-content">
        <p class="eyebrow">CAI</p>
        <h1>{{ caiNombre }}</h1>
        <p class="subtitle">Detalle operativo del CAI seleccionado.</p>
      </div>
      <div class="hero-cards">
        <div class="info-card">
          <span class="label">ID</span>
          <strong>#{{ caiId }}</strong>
        </div>
        <div class="info-card">
          <span class="label">Canton</span>
          <strong>{{ cantonLabel }}</strong>
        </div>
        <div class="info-card">
          <span class="label">Provincia</span>
          <strong>{{ provinciaLabel }}</strong>
        </div>
      </div>
    </section>

    <section class="detail-body">
      <div v-if="isLoading" class="status">Cargando CAI...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
      <div v-else class="summary">
        <div class="summary-item">
          <span class="summary-label">Nombre</span>
          <strong>{{ caiNombre }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">ID CAI</span>
          <strong>{{ caiId }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">Canton</span>
          <strong>{{ cantonLabel }}</strong>
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
import { getCais } from "../../../../service/cai.service.js";
import { getCantones } from "../../../../service/cantones.service.js";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.cais)) return payload.cais;
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

const mapCai = (item) => {
  const rawId = item?.id ?? item?.caiId ?? item?.idCai;
  const cantonId = item?.cantonId ?? item?.idCanton ?? item?.canton?.id;
  const provinciaId = item?.provinciaId ?? item?.idProvincia ?? item?.canton?.provincia?.id;
  return {
    id: Number.isNaN(Number(rawId)) ? rawId : Number(rawId),
    nombre: item?.nombre ?? item?.name ?? item?.cai ?? "",
    cantonId: Number.isNaN(Number(cantonId)) ? cantonId : Number(cantonId),
    cantonNombre: item?.canton?.nombre ?? item?.cantonNombre ?? "",
    provinciaId: Number.isNaN(Number(provinciaId)) ? provinciaId : Number(provinciaId),
    provinciaNombre: item?.canton?.provincia?.nombre ?? item?.provinciaNombre ?? "",
  };
};

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const caiId = computed(() => Number(route.params.id));

    const cai = ref(null);
    const cantones = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref("");

    const caiNombre = computed(() => {
      if (cai.value?.nombre) return cai.value.nombre;
      return caiId.value ? `CAI #${caiId.value}` : "CAI";
    });

    const cantonLabel = computed(() => {
      if (!cai.value) return "-";
      return cai.value.cantonNombre
        ? cai.value.cantonNombre
        : cai.value.cantonId || "-";
    });

    const provinciaLabel = computed(() => {
      if (!cai.value) return "-";
      return cai.value.provinciaNombre
        ? cai.value.provinciaNombre
        : cai.value.provinciaId || "-";
    });

    const loadData = async () => {
      isLoading.value = true;
      errorMessage.value = "";
      try {
        const [caiRes, cantonRes] = await Promise.all([getCais(), getCantones()]);
        if (caiRes.data?.success === false) {
          errorMessage.value = caiRes.data?.message || "No se pudo cargar el CAI.";
          cai.value = null;
          return;
        }
        const caiList = resolveList(caiRes).map(mapCai);
        const cantonList = resolveList(cantonRes).map(mapCanton);
        cantones.value = cantonList.filter((item) => item.nombre);
        const match = caiList.find((item) => Number(item.id) === caiId.value);
        if (!match) {
          errorMessage.value = "CAI no encontrado.";
          cai.value = null;
          return;
        }
        const cantonRef = match.cantonId
          ? cantones.value.find((item) => String(item.id) === String(match.cantonId))
          : null;
        cai.value = {
          ...match,
          cantonNombre: match.cantonNombre || cantonRef?.nombre || "",
          provinciaId: match.provinciaId || cantonRef?.provinciaId,
          provinciaNombre: match.provinciaNombre || cantonRef?.provinciaNombre || "",
        };
      } catch (err) {
        console.error("Error cargando CAI:", err);
        errorMessage.value = "Error de conexion con el servidor.";
        cai.value = null;
      } finally {
        isLoading.value = false;
      }
    };

    // --- CORRECCIÓN AQUÍ ---
    const goBack = () => {
      // Usamos el 'name' de la ruta definido en tu router.js
      // En tu router tienes: { path: "cai", name: "cai", component: CaisView }
      router.push({ name: 'cai' });
    };
    // ----------------------

    onMounted(loadData);

    return {
      caiId,
      caiNombre,
      cantonLabel,
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