<template>
  <div v-if="item" class="detail">
    <div class="header">
      <p class="eyebrow">Catálogos</p>
      <h2 class="title">{{ item.nombre }}</h2>
      <p class="subtitle">Detalle de la ocupación seleccionada</p>
    </div>

    <div class="card">
      <div class="row">
        <span class="label">ID</span>
        <span class="value">#{{ item.id }}</span>
      </div>

      <div class="row">
        <span class="label">Nombre</span>
        <span class="value">{{ item.nombre }}</span>
      </div>
    </div>
  </div>

  <div v-else class="status">Cargando detalle...</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getOcupaciones } from "@/service/ocupacion.service.js";

const route = useRoute();
const item = ref(null);

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.ocupaciones)) return payload.ocupaciones;
  return [];
};

onMounted(async () => {
  try {
    const res = await getOcupaciones();
    const list = resolveList(res);

    const idParam = String(route.params.id);
    item.value = list.find((x) => String(x?.id ?? x?.ocupacionId ?? x?.idOcupacion) === idParam) || null;
  } catch (e) {
    console.error("Error cargando ocupación:", e);
    item.value = null;
  }
});
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white;
  padding: 24px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}

.header::before,
.header::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.header::before {
  width: 220px;
  height: 220px;
  top: -60px;
  right: -40px;
}

.header::after {
  width: 140px;
  height: 140px;
  bottom: -50px;
  left: 40px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.7rem;
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 1;
}

.title {
  margin: 0 0 6px;
  font-size: 1.6rem;
  position: relative;
  z-index: 1;
}

.subtitle {
  margin: 0;
  font-size: 0.98rem;
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  z-index: 1;
}

.card {
  background: white;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 12px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #475569;
  font-weight: 800;
}

.value {
  font-size: 0.98rem;
  color: #0f172a;
  font-weight: 700;
}

.status {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.92rem;
}
</style>
