<template>
  <div class="detail-page">
    <button class="back" type="button" @click="goBack">
      Volver a provincias
    </button>

    <section class="detail-hero" v-if="provincia">
      <div class="hero-content">
        <p class="eyebrow">Provincia</p>
        <h1>{{ provincia.nombre }}</h1>
        <p class="subtitle">
          Detalle operativo para el catalogo de {{ provincia.nombre }}.
        </p>
      </div>
      <div class="hero-cards">
        <div class="info-card">
          <span class="label">Codigo</span>
          <strong>{{ provincia.codigo }}</strong>
        </div>
        <div class="info-card">
          <span class="label">Region</span>
          <strong>{{ provincia.region }}</strong>
        </div>
        <div class="info-card">
          <span class="label">Capital</span>
          <strong>{{ provincia.capital }}</strong>
        </div>
        <div class="info-card">
          <span class="label">Estado</span>
          <strong>{{ provincia.estado === "activa" ? "Activa" : "Inactiva" }}</strong>
        </div>
      </div>
    </section>

    <section class="cantones" v-if="provincia">
      <div class="section-header">
        <div>
          <h2>Cantones</h2>
          <p>Listado referencial para integracion con la API.</p>
        </div>
        <span class="counter">{{ cantones.length }} cantones</span>
      </div>
      <div class="cantones-grid">
        <div v-for="canton in cantones" :key="canton" class="canton-card">
          <span>{{ canton }}</span>
          <span class="tag">Activo</span>
        </div>
      </div>
    </section>

    <section class="empty" v-else>
      <h2>Provincia no encontrada</h2>
      <p>Revisa el identificador o vuelve al listado principal.</p>
    </section>
  </div>
</template>

<script>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const provincias = [
  {
    id: 1,
    nombre: "Azuay",
    codigo: "AZU",
    region: "Sierra",
    capital: "Cuenca",
    estado: "activa",
    cantones: ["Cuenca", "Gualaceo", "Paute", "Sigsig", "Nabon"],
  },
  {
    id: 2,
    nombre: "Bolivar",
    codigo: "BOL",
    region: "Sierra",
    capital: "Guaranda",
    estado: "activa",
    cantones: ["Guaranda", "Chimbo", "San Miguel", "Echeandia"],
  },
  {
    id: 3,
    nombre: "Guayas",
    codigo: "GYE",
    region: "Costa",
    capital: "Guayaquil",
    estado: "activa",
    cantones: ["Guayaquil", "Samborondon", "Daule", "Milagro", "Duran"],
  },
  {
    id: 4,
    nombre: "Manabi",
    codigo: "MAB",
    region: "Costa",
    capital: "Portoviejo",
    estado: "activa",
    cantones: ["Portoviejo", "Manta", "Chone", "Jipijapa", "Pedernales"],
  },
  {
    id: 5,
    nombre: "Pichincha",
    codigo: "PIC",
    region: "Sierra",
    capital: "Quito",
    estado: "activa",
    cantones: ["Quito", "Cayambe", "Mejia", "Ruminahui"],
  },
  {
    id: 6,
    nombre: "Orellana",
    codigo: "ORE",
    region: "Amazonia",
    capital: "Francisco de Orellana",
    estado: "activa",
    cantones: ["Orellana", "Aguarico", "La Joya", "Loreto"],
  },
];

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const provinciaId = computed(() => Number(route.params.id));

    const provincia = computed(() =>
      provincias.find((item) => item.id === provinciaId.value)
    );

    const cantones = computed(() => (provincia.value ? provincia.value.cantones : []));

    const goBack = () => {
      router.push("/app/provincias");
    };

    return {
      provincia,
      cantones,
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

@media (max-width: 640px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
