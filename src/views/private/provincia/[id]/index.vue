<template>
  <div class="detail-page">
    <button class="back" type="button" @click="goBack">
      Volver a provincias
    </button>

    <section class="detail-hero">
      <div class="hero-content">
        <p class="eyebrow">Provincia</p>
        <h1>{{ provinciaInfo.nombre }}</h1>
        <p class="subtitle">
          Detalle operativo para el catalogo de {{ provinciaInfo.nombre }}.
        </p>
      </div>
      <div class="hero-cards">
        <div class="info-card">
          <span class="label">ID</span>
          <strong>#{{ provinciaInfo.id }}</strong>
        </div>
      </div>
    </section>

    <section class="cantones">
      <div class="section-header">
        <div>
          <h2>Cantones</h2>
          <p>Listado referencial para integracion con la API.</p>
        </div>
        <span class="counter">{{ cantones.length }} cantones</span>
      </div>
      <div v-if="isLoading" class="status">Cargando cantones...</div>
      <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
      <div class="cantones-grid">
        <div v-for="canton in cantones" :key="canton.id" class="canton-card">
          <div class="canton-main">
            <span class="canton-name">{{ canton.nombre }}</span>
            <span class="canton-id">ID {{ canton.id }}</span>
          </div>
          <span class="tag">
            {{
              canton.provinciaNombre
                ? canton.provinciaNombre
                : canton.provinciaId
                ? `Prov ${canton.provinciaId}`
                : "Prov -"
            }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCantones } from "../../../../service/cantones.service.js";
import { getProvincias } from "../../../../service/provincias.service.js";

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.provincias)) return payload.provincias;
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
    const provinciaId = computed(() => Number(route.params.id));
    const provinciaNombre = ref("");
    const cantones = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref("");

    const provinciaInfo = computed(() => {
      const id = provinciaId.value;
      const nombre = provinciaNombre.value
        ? provinciaNombre.value
        : id
        ? `Provincia #${id}`
        : "Provincia";
      return { id, nombre };
    });

    const loadProvincia = async () => {
      try {
        const res = await getProvincias();
        if (res.data?.success === false) {
          provinciaNombre.value = "";
          return;
        }
        const list = resolveList(res);
        const match = list.find((item) => Number(item?.id) === provinciaId.value);
        provinciaNombre.value = match?.nombre ?? match?.name ?? match?.provincia ?? "";
      } catch (err) {
        console.error("Error cargando provincia:", err);
        provinciaNombre.value = "";
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
        cantones.value = mapped.filter((item) => {
          if (!idValue) return true;
          return Number(item.provinciaId) === idValue;
        });
        if (!provinciaNombre.value && cantones.value.length) {
          provinciaNombre.value = cantones.value[0].provinciaNombre;
        }
      } catch (err) {
        console.error("Error cargando cantones:", err);
        errorMessage.value = "Error de conexion con el servidor.";
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

    return {
      provinciaInfo,
      cantones,
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

.cantones {
  background: white;
  border-radius: 18px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.section-header h2 {
  margin: 0 0 6px;
}

.section-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.counter {
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.cantones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.canton-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
}

.canton-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.canton-name {
  font-weight: 600;
  color: #0f172a;
}

.canton-id {
  font-size: 0.8rem;
  color: #64748b;
}

.tag {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.empty {
  background: white;
  padding: 26px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.status {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.92rem;
  margin-bottom: 12px;
}

.status.error {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

@media (max-width: 640px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
