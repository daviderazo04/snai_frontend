<template>
  <div class="educa-detail-page">
    <div v-if="loading" class="status">Cargando...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div v-else-if="!item" class="status error">No se encontró el registro.</div>

    <div v-else>
      <section class="hero">
        <button class="btn-back" @click="router.back()" aria-label="Volver">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div class="hero-main">
          <p class="eyebrow">Reporte Académico</p>
          <h1>{{ item.adolescenteNombre }}</h1>
          <p class="subtitle">
            Institución: <strong>{{ item.institucion || "—" }}</strong>
          </p>
        </div>

        <div class="hero-stats">
          <div class="stat-card">
            <span class="label">Nivel</span>
            <strong>{{ item.nivel || "—" }}</strong>
            <span class="hint">Nivel educativo</span>
          </div>

          <div class="stat-card">
            <span class="label">Ciclo</span>
            <strong>{{ item.cicloAcademico || "—" }}</strong>
            <span class="hint">Ciclo académico</span>
          </div>

          <div class="stat-card" :class="{ active: item.estudia === '1' }">
            <span class="label">Estado</span>
            <strong>{{ item.estudia === "1" ? "Estudia" : "No estudia" }}</strong>
            <span class="hint">Situación actual</span>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="grid">
          <div class="field">
            <span class="field-label">ID Registro</span>
            <span class="field-value">#{{ item.id }}</span>
          </div>

          <div class="field">
            <span class="field-label">Adolescente ID</span>
            <span class="field-value">#{{ item.adolescenteId }}</span>
          </div>

          <div class="field">
            <span class="field-label">Cédula</span>
            <span class="field-value">{{ item.adolescenteCedula || "—" }}</span>
          </div>

          <div class="field">
            <span class="field-label">Fecha</span>
            <span class="field-value">{{ item.fecha || "—" }}</span>
          </div>

          <div class="field">
            <span class="field-label">Estado</span>
            <span class="field-value">{{ item.estudia === "1" ? "Estudia" : "No estudia" }}</span>
          </div>

          <div class="field">
            <span class="field-label">Modalidad</span>
            <span class="field-value">{{ item.modalidad || "—" }}</span>
          </div>

          <div class="field">
            <span class="field-label">Carrera</span>
            <span class="field-value">{{ item.carrera || "—" }}</span>
          </div>

          <div class="field">
            <span class="field-label">Contacto</span>
            <span class="field-value">{{ item.contacto || "—" }}</span>
          </div>

          <div class="field full" v-if="item.estudia === '0'">
            <span class="field-label">Razón no estudia</span>
            <span class="field-value danger">
              {{ item.razonNoEstudia || "—" }}
            </span>
          </div>

          <div class="field full">
            <span class="field-label">Observación</span>
            <span class="field-value long">
              {{ item.observacion || "Sin observaciones registradas por el docente o tutor." }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getEducaciones } from "@/service/educacion.service.js";
import { getAdolescentes, getAdolescenteById } from "@/service/adolescente.service.js";

const route = useRoute();
const router = useRouter();

const item = ref(null);
const adolescentes = ref([]);
const loading = ref(true);
const errorMessage = ref("");

const resolveList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.educaciones)) return payload.educaciones;
  if (Array.isArray(payload?.educa)) return payload.educa;
  return [];
};

const normalize01 = (v, fallback = "0") => {
  const s =
    v === 1 || v === true
      ? "1"
      : v === 0 || v === false
      ? "0"
      : String(v ?? "");
  return s === "1" || s === "0" ? s : fallback;
};

const adolescentesById = computed(() => {
  const map = new Map();
  adolescentes.value.forEach((ad) => {
    if (!ad?.id) return;
    const nombres = ad?.nombre ?? ad?.nombres ?? "";
    const apellidos = ad?.apellido ?? ad?.apellidos ?? "";
    map.set(String(ad.id), {
      nombre: `${nombres} ${apellidos}`.trim() || `Adolescente #${ad.id}`,
      cedula: ad?.cedula ?? "",
    });
  });
  return map;
});

const mapItem = (row) => {
  const rawId = row?.id ?? row?.educaId ?? row?.educacionId ?? row?.idEduca ?? row?.idEducacion;
  const idNum = Number(rawId);

  const adolescenteRaw =
    row?.adolescenteId ?? row?.adolescente_id ?? row?.idAdolescente ?? row?.adolescente?.id;
  const adolescenteIdNum = Number(adolescenteRaw);

  const adolObj = row?.adolescente ?? null;
  const nombres = adolObj?.nombres ?? adolObj?.nombre ?? "";
  const apellidos = adolObj?.apellidos ?? adolObj?.apellido ?? "";
  const fullName = `${nombres} ${apellidos}`.trim();
  const lookup = adolescentesById.value.get(String(adolescenteIdNum));

  return {
    id: Number.isNaN(idNum) ? rawId : idNum,
    adolescenteId: Number.isNaN(adolescenteIdNum) ? adolescenteRaw : adolescenteIdNum,
    adolescenteNombre:
      fullName || lookup?.nombre || (adolescenteRaw ? `Adolescente #${adolescenteRaw}` : "Adolescente"),
    adolescenteCedula: adolObj?.cedula ?? lookup?.cedula ?? "",
    fecha: row?.fecha ?? row?.date ?? "",
    estudia: normalize01(row?.estudia, "0"),
    razonNoEstudia: row?.razonNoEstudia ?? row?.razon_no_estudia ?? "",
    nivel: row?.nivel ?? "",
    cicloAcademico: row?.cicloAcademico ?? row?.ciclo_academico ?? "",
    carrera: row?.carrera ?? "",
    institucion: row?.institucion ?? "",
    modalidad: row?.modalidad ?? "",
    contacto: row?.contacto ?? "",
    observacion: row?.observacion ?? "",
  };
};

onMounted(async () => {
  loading.value = true;
  errorMessage.value = "";
  item.value = null;

  try {
    try {
      const adolsRes = await getAdolescentes({ size: 500 });
      const payload = adolsRes?.data?.data ?? adolsRes?.data;
      if (Array.isArray(payload)) adolescentes.value = payload;
      else if (Array.isArray(payload?.data)) adolescentes.value = payload.data;
      else if (Array.isArray(payload?.items)) adolescentes.value = payload.items;
    } catch (err) {
      console.warn("No se pudo cargar adolescentes:", err);
    }

    // por si tu servicio acepta params { page, size }
    let res;
    try {
      res = await getEducaciones({ page: 1, size: 500 });
    } catch {
      res = await getEducaciones();
    }

    const list = resolveList(res).map(mapItem);
    const idParam = String(route.params.id);

    item.value = list.find((x) => String(x.id) === idParam) || null;

    if (item.value?.adolescenteId && !item.value?.adolescenteCedula) {
      try {
        const adolRes = await getAdolescenteById(item.value.adolescenteId);
        const adol = adolRes?.data?.data ?? adolRes?.data ?? null;
        if (adol?.id) {
          const nombres = adol?.nombre ?? adol?.nombres ?? "";
          const apellidos = adol?.apellido ?? adol?.apellidos ?? "";
          item.value = {
            ...item.value,
            adolescenteNombre: `${nombres} ${apellidos}`.trim() || item.value.adolescenteNombre,
            adolescenteCedula: adol?.cedula ?? item.value.adolescenteCedula,
          };
        }
      } catch (err) {
        console.warn("No se pudo cargar adolescente individual:", err);
      }
    }
  } catch (e) {
    console.error("Error cargando detalle educación:", e);
    errorMessage.value = "No se pudo cargar el detalle del registro.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.educa-detail-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%);
  color: white;
  padding: 26px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.hero::before {
  width: 220px;
  height: 220px;
  top: -60px;
  right: -40px;
}

.hero::after {
  width: 140px;
  height: 140px;
  bottom: -50px;
  left: 40px;
}

.btn-back {
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: grid;
  place-items: center;
  backdrop-filter: blur(6px);
  margin-bottom: 12px;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.16);
}

.hero-main {
  position: relative;
  z-index: 1;
  max-width: 720px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.7rem;
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.7);
}

.hero-main h1 {
  margin: 0 0 8px;
  font-size: 1.8rem;
}

.subtitle {
  margin: 0;
  font-size: 0.98rem;
  color: rgba(255, 255, 255, 0.85);
}

.hero-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 14px 16px;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  opacity: 0.85;
}

.stat-card.active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.22);
}

.stat-card strong {
  font-size: 1.2rem;
}

.label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
}

.hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: white;
  padding: 22px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  font-weight: 800;
}

.field-value {
  color: #0f172a;
  font-weight: 700;
  font-size: 0.98rem;
}

.field-value.danger {
  color: #b91c1c;
}

.field-value.long {
  line-height: 1.6;
  color: #334155;
  font-weight: 600;
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

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .hero-main h1 {
    font-size: 1.55rem;
  }
}
</style>
