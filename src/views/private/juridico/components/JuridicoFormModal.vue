<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="closeAndReset">
      <div class="modal">
        
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nuevo Registro Jurídico" : "Editar Registro Jurídico" }}</h3>
            <p class="subtitle">Búsqueda global habilitada para todos los registros</p>
          </div>
          <button class="btn-close" type="button" @click="closeAndReset" :disabled="saving">✕</button>
        </div>

        <form class="form-content" @submit.prevent="handleSaveInternal">
          <div class="modal-body">
            
            <h4 class="internal-title">Identificación y Causa</h4>
            <div class="form-grid">
              <div class="field full-width autocomplete">
                <span>Adolescente <span class="required">*</span></span>
                <input 
                  v-model="adolescenteQuery" 
                  placeholder="Escriba nombre o apellido para buscar..." 
                  @focus="handleAdolescenteFocus" 
                  :disabled="saving" 
                />
                <ul v-if="showAdolescentes && adolescentes.length" class="dropdown">
                  <li v-for="a in adolescentes" :key="a.id" @click="selectAdolescente(a)">
                    {{ a.label }}
                  </li>
                </ul>
              </div>

              <div class="field full-width autocomplete">
                <span>Delito <span class="required">*</span></span>
                <input 
                  v-model="delitoQuery" 
                  placeholder="Buscar delito..." 
                  @focus="showDelitos = true" 
                  :disabled="saving" 
                />
                <ul v-if="showDelitos && filteredDelitos.length" class="dropdown">
                  <li v-for="d in filteredDelitos" :key="d.id" @click="selectDelito(d)">
                    {{ d.nombre }}
                  </li>
                </ul>
              </div>

              <label class="field full-width">
                <span>N° de Causa <span class="required">*</span></span>
                <input v-model="form.numeroCausa" placeholder="Ej: 09320-2022-0001" :disabled="saving" />
              </label>
            </div>

            <div class="section-divider"></div>

            <h4 class="internal-title">Autoridades y Documentación</h4>
            <div class="form-grid">
              <label class="field"><span>Juez</span><input v-model="form.juez" /></label>
              <label class="field"><span>Fiscal</span><input v-model="form.fiscal" /></label>
              <label class="field"><span>Defensor</span><input v-model="form.defensor" /></label>
              <label class="field"><span>Medidas</span><input v-model="form.medidas" /></label>
              <label class="field"><span>Boleta Preventivo</span><input v-model="form.boletaPreventivo" /></label>
              <label class="field"><span>Boleta Cárcel</span><input v-model="form.boletaCarcel" /></label>
            </div>

            <div class="section-divider"></div>

            <h4 class="internal-title">Cómputo y Fechas Automáticas</h4>
            <div class="form-grid">
              <label class="field"><span>Años</span><input type="number" v-model.number="form.tiempoAnio" /></label>
              <label class="field"><span>Meses</span><input type="number" v-model.number="form.tiempoMes" /></label>
              <label class="field"><span>Días</span><input type="number" v-model.number="form.sentenciaDia" /></label>
              <label class="field"><span>Fecha Audiencia</span><input type="date" v-model="form.fechaAudiencia" /></label>
              <label class="field"><span>Fecha Sentencia</span><input type="date" v-model="form.fechaSentencia" /></label>
              <label class="field"><span>Fecha Inicio <span class="required">*</span></span><input type="date" v-model="form.fechaInicio" /></label>
              
              <label class="field"><span>Fecha Fin 🔒</span><input type="date" v-model="form.fechaFin" readonly class="readonly-input" /></label>
              <label class="field"><span>Fecha 60% 🔒</span><input type="date" v-model="form.fecha60" readonly class="readonly-input" /></label>
              <label class="field"><span>Fecha 80% 🔒</span><input type="date" v-model="form.fecha80" readonly class="readonly-input" /></label>
            </div>

            <div class="section-divider"></div>

            <h4 class="internal-title">Recursos y Egreso</h4>
            <div class="form-grid">
              <label class="field"><span>Recurso Apelación</span><input v-model="form.recApelMod" /></label>
              <label class="field"><span>Fecha Apelación</span><input type="date" v-model="form.RecApelFecha" /></label>
              <label class="field"><span>Recurso Casación</span><input v-model="form.casacionRecurso" placeholder="Ej: No presentado" /></label>
              <label class="field"><span>Fecha Casación</span><input type="date" v-model="form.casacionFecha" /></label>
              <label class="field"><span>Fecha Egreso Real</span><input type="date" v-model="form.egresoFecha" /></label>
              <label class="field full-width"><span>Motivo Egreso</span><textarea rows="2" v-model="form.egresoMotivo"></textarea></label>
            </div>
          </div>

          <div class="actions">
            <button type="button" class="btn-ghost" @click="closeAndReset" :disabled="saving">Cancelar</button>
            <button 
              type="submit" 
              class="btn-primary" 
              :disabled="saving || !isFormValid"
              :class="{ 'btn-disabled': !isFormValid }"
            >
              <span v-if="saving" class="loader"></span>
              {{ saving ? 'Guardando...' : 'Guardar y Cerrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue";
import { getAdolescentes } from "@/service/adolescente.service";
import { getDelitos } from "@/service/delito.service";

const props = defineProps({ open: Boolean, mode: String, initialData: Object, saving: Boolean });
const emit = defineEmits(["close", "save"]);

const adolescenteQuery = ref("");
const delitoQuery = ref("");
const adolescentes = ref([]);
const delitos = ref([]);
const showAdolescentes = ref(false);
const showDelitos = ref(false);

const emptyForm = () => ({
  adolescenteId: null, delitoId: null, numeroCausa: "", juez: "", defensor: "", fiscal: "",
  medidas: "", boletaPreventivo: "", boletaCarcel: "", fechaInicio: "", fechaAudiencia: "", 
  fechaSentencia: "", tiempoAnio: 0, tiempoMes: 0, sentenciaDia: 0, fechaFin: "", 
  fecha60: "", fecha80: "", recApelMod: "", RecApelFecha: "", casacionRecurso: "", 
  casacionFecha: "", egresoFecha: "", egresoMotivo: "",
});

const form = reactive(emptyForm());

// --- BÚSQUEDA DINÁMICA DE ADOLESCENTES ---
const searchAdolescentes = async (q) => {
  // Al enviar 'nombre', el backend busca en todas las páginas
  const res = await getAdolescentes({ nombre: q || undefined, page: 1, size: 20 });
  adolescentes.value = (res.data?.data || []).map(a => ({ 
    id: a.id, 
    label: `${a.nombre} ${a.apellido} (${a.cedula})` 
  }));
};

watch(adolescenteQuery, (newVal) => {
  // Solo buscamos si no hemos seleccionado ya a alguien (id es null)
  if (!form.adolescenteId) {
    searchAdolescentes(newVal);
  }
});

const handleAdolescenteFocus = () => {
  showAdolescentes.value = true;
  if (!form.adolescenteId) searchAdolescentes(adolescenteQuery.value);
};

const selectAdolescente = (a) => {
  form.adolescenteId = a.id;
  adolescenteQuery.value = a.label;
  showAdolescentes.value = false;
};

// --- BÚSQUEDA DE DELITOS (CARGA COMPLETA AL INICIO) ---
const selectDelito = (d) => {
  form.delitoId = d.id;
  delitoQuery.value = d.nombre;
  showDelitos.value = false;
};

const filteredDelitos = computed(() => {
  const query = delitoQuery.value.toLowerCase();
  return delitos.value
    .filter(d => d.nombre.toLowerCase().includes(query))
    .slice(0, 10); // Mostramos solo los primeros 10 que coincidan
});

onMounted(async () => {
  // Cargamos una lista grande de delitos para filtrar localmente sin problemas de página
  const { data } = await getDelitos({ size: 1000 });
  delitos.value = data?.data || data || [];
});

const handleSaveInternal = () => {
  const payload = JSON.parse(JSON.stringify(form));
  const toISO = (d) => (d ? new Date(d).toISOString() : null);
  payload.RecApelFecha = toISO(payload.RecApelFecha);
  payload.casacionFecha = toISO(payload.casacionFecha);
  payload.egresoFecha = toISO(payload.egresoFecha);

  Object.keys(payload).forEach(k => {
    if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
  });

  emit("save", payload);
};

// --- CÁLCULOS AUTOMÁTICOS ---
const calculateDates = () => {
  if (!form.fechaInicio) return;
  const start = new Date(form.fechaInicio + 'T12:00:00');
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + (Number(form.tiempoAnio) || 0));
  end.setMonth(end.getMonth() + (Number(form.tiempoMes) || 0));
  end.setDate(end.getDate() + (Number(form.sentenciaDia) || 0));
  form.fechaFin = end.toISOString().split('T')[0];
  
  const diff = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
  if (diff > 0) {
    const d60 = new Date(start); d60.setDate(d60.getDate() + Math.floor(diff * 0.6));
    form.fecha60 = d60.toISOString().split('T')[0];
    const d80 = new Date(start); d80.setDate(d80.getDate() + Math.floor(diff * 0.8));
    form.fecha80 = d80.toISOString().split('T')[0];
  }
};
watch([() => form.fechaInicio, () => form.tiempoAnio, () => form.tiempoMes, () => form.sentenciaDia], calculateDates);

const closeAndReset = () => {
  Object.assign(form, emptyForm());
  adolescenteQuery.value = ""; 
  delitoQuery.value = "";
  emit("close");
};

watch(() => props.initialData, (v) => {
  if (!v) return;
  if (v.adolescente) { 
    form.adolescenteId = v.adolescente.id; 
    adolescenteQuery.value = `${v.adolescente.nombre} ${v.adolescente.apellido} (${v.adolescente.cedula})`; 
  }
  if (v.delito) { 
    form.delitoId = v.delito.id; 
    delitoQuery.value = v.delito.nombre; 
  }
  Object.keys(form).forEach(k => { 
    if (v[k] !== undefined) form[k] = (typeof v[k] === 'string' && v[k].includes('T')) ? v[k].split('T')[0] : v[k]; 
  });
}, { immediate: true });

const isFormValid = computed(() => {
  return (
    form.adolescenteId &&
    form.delitoId &&
    form.numeroCausa?.trim() !== "" &&
    form.fechaInicio
  );
});


</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
.modal { background: white; border-radius: 24px; width: min(720px, 95vw); max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.form-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.modal-body { padding: 0 32px 32px 32px; overflow-y: auto; flex: 1; }
.modal-header { padding: 24px 32px; display: flex; justify-content: space-between; }
.modal-header h3 { margin: 0; font-size: 1.4rem; font-weight: 800; color: #0f172a; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-top: 4px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 6px; position: relative; }
.field.full-width { grid-column: 1 / -1; }
.field span { font-size: 0.85rem; font-weight: 700; color: #334155; }
.field input, .field select, .field textarea { padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc; font-size: 1rem; }
.readonly-input { background: #e2e8f0 !important; color: #475569; cursor: not-allowed; border-color: #cbd5e1 !important; }
.section-divider { height: 1px; background: #f1f5f9; margin: 32px 0; }
.internal-title { font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; font-weight: 800; margin-bottom: 16px; }
.actions { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; }
.btn-primary { background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); color: white; border: none; padding: 12px 28px; border-radius: 14px; font-weight: 700; cursor: pointer; }
.btn-ghost { padding: 12px 24px; border-radius: 14px; border: 1px solid #e2e8f0; background: white; font-weight: 600; cursor: pointer; }
.dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 14px; z-index: 100; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 8px; list-style: none; margin-top: 5px; }
.dropdown li { padding: 10px 14px; cursor: pointer; border-radius: 10px; font-size: 0.9rem; }
.dropdown li:hover { background: #eff6ff; color: #2563eb; }
.required { color: #ef4444; }
.loader { width: 14px; height: 14px; border: 2px solid #FFF; border-bottom-color: transparent; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; margin-right: 8px; }
@keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.btn-primary:disabled,
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #94a3b8 !important; /* gris elegante */
}

.btn-close {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Líneas de la X */
.btn-close span {
  position: absolute;
  width: 18px;
  height: 2px;
  background: #64748b;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.btn-close span:first-child {
  transform: rotate(45deg);
}

.btn-close span:last-child {
  transform: rotate(-45deg);
}

/* Hover elegante */
.btn-close:hover {
  background: #f1f5f9;
}

.btn-close:hover span {
  background: #ef4444; /* rojo suave */
}

/* Disabled */
.btn-close:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

</style>