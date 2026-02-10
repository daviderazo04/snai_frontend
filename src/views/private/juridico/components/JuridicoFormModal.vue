<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="closeAndReset">
      <div class="modal">
        
        <div class="modal-header">
          <div class="header-text">
            <h3>{{ mode === "create" ? "Nuevo Registro Jurídico" : "Editar Registro Jurídico" }}</h3>
            <p class="subtitle">Información completa sincronizada con API</p>
          </div>
          <button class="btn-close" type="button" @click="closeAndReset" :disabled="saving">✕</button>
        </div>

        <form class="form-content" @submit.prevent="handleSaveInternal">
          <div class="modal-body">
            
            <h4 class="internal-title">Identificación y Causa</h4>
            <div class="form-grid">
              <div class="field full-width autocomplete" ref="adolescenteRef">
                <span>Adolescente <span class="required">*</span></span>
                <input v-model="adolescenteQuery" placeholder="Buscar..." @focus="handleAdolescenteFocus" :disabled="saving" />
                <ul v-if="showAdolescentes" class="dropdown">
                  <li v-for="a in adolescentes" :key="a.id" @click="selectAdolescente(a)">{{ a.label }}</li>
                </ul>
              </div>

              <div class="field full-width autocomplete" ref="delitoRef">
                <span>Delito <span class="required">*</span></span>
                <input v-model="delitoQuery" placeholder="Buscar delito..." @focus="showDelitos = true" :disabled="saving" />
                <ul v-if="showDelitos" class="dropdown">
                  <li v-for="d in filteredDelitos" :key="d.id" @click="selectDelito(d)">{{ d.nombre }}</li>
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
              
              <label class="field">
                <span>Fecha Fin 🔒</span>
                <input type="date" v-model="form.fechaFin" readonly class="readonly-input" />
              </label>
              <label class="field">
                <span>Fecha 60% 🔒</span>
                <input type="date" v-model="form.fecha60" readonly class="readonly-input" />
              </label>
              <label class="field">
                <span>Fecha 80% 🔒</span>
                <input type="date" v-model="form.fecha80" readonly class="readonly-input" />
              </label>
            </div>

            <div class="section-divider"></div>

            <h4 class="internal-title">Recursos y Egreso</h4>
            <div class="form-grid">
              <label class="field"><span>Recurso Apelación</span><input v-model="form.recApelMod" /></label>
              <label class="field"><span>Fecha Apelación</span><input type="date" v-model="form.RecApelFecha" /></label>
              <label class="field">
                <span>¿Casación?</span>
                <select v-model="form.casacionRecurso">
                  <option value="n">NO</option>
                  <option value="s">SI</option>
                </select>
              </label>
              <label class="field">
                <span>Fecha Casación</span>
                <input 
                  type="date" 
                  v-model="form.casacionFecha" 
                  :disabled="form.casacionRecurso === 'n'" 
                  :class="{ 'readonly-input': form.casacionRecurso === 'n' }" 
                />
              </label>
              <label class="field"><span>Fecha Egreso Real</span><input type="date" v-model="form.egresoFecha" /></label>
              <label class="field full-width"><span>Motivo Egreso</span><textarea rows="2" v-model="form.egresoMotivo"></textarea></label>
            </div>
          </div>

          <div class="actions">
            <button type="button" class="btn-ghost" @click="closeAndReset" :disabled="saving">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
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
const adolescenteRef = ref(null);
const delitoRef = ref(null);

const emptyForm = () => ({
  adolescenteId: null, delitoId: null, numeroCausa: "", juez: "", defensor: "", fiscal: "",
  medidas: "", boletaPreventivo: "", boletaCarcel: "", fechaInicio: "", fechaAudiencia: "", 
  fechaSentencia: "", tiempoAnio: 0, tiempoMes: 0, sentenciaDia: 0, fechaFin: "", 
  fecha60: "", fecha80: "", recApelMod: "", RecApelFecha: "", casacionRecurso: "n", 
  casacionFecha: "", egresoFecha: "", egresoMotivo: "",
});

const form = reactive(emptyForm());

const handleSaveInternal = () => {
  const payload = JSON.parse(JSON.stringify(form));

  // CORRECCIÓN PARA EL ERROR 500: Limpieza estricta de Casación
  if (payload.casacionRecurso === 'n') {
    payload.casacionFecha = null; // Obligamos a que sea null si no hay casación
  }

  // Formateo ISO para campos de fecha/hora
  const toISO = (d) => (d ? new Date(d).toISOString() : null);
  payload.RecApelFecha = toISO(payload.RecApelFecha);
  payload.casacionFecha = toISO(payload.casacionFecha);
  payload.egresoFecha = toISO(payload.egresoFecha);

  // Limpiar campos vacíos para que la base de datos no reciba strings vacíos ""
  Object.keys(payload).forEach(k => {
    if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
  });

  console.log("📤 Enviando Payload Limpio:", payload);
  emit("save", payload);
};

// Cierre automático cuando la API responde con éxito
watch(() => props.saving, (isSaving, wasSaving) => {
  if (wasSaving && !isSaving && props.open) {
    closeAndReset();
  }
});

// Cálculos automáticos de fechas
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

// Lógica de autocompletado
const searchAdolescentes = async (q) => {
  const res = await getAdolescentes({ nombre: q || undefined, page: 1, size: 10 });
  adolescentes.value = (res.data?.data || []).map(a => ({ id: a.id, label: `${a.nombre} ${a.apellido}` }));
};
const handleAdolescenteFocus = () => { if (!form.adolescenteId) { showAdolescentes.value = true; searchAdolescentes(adolescenteQuery.value); } };
watch(adolescenteQuery, (q) => { if (!form.adolescenteId) searchAdolescentes(q); });
const selectAdolescente = (a) => { form.adolescenteId = a.id; adolescenteQuery.value = a.label; showAdolescentes.value = false; };
const selectDelito = (d) => { form.delitoId = d.id; delitoQuery.value = d.nombre; showDelitos.value = false; };
const filteredDelitos = computed(() => delitos.value.filter(d => d.nombre.toLowerCase().includes(delitoQuery.value.toLowerCase())));

onMounted(async () => {
  const { data } = await getDelitos();
  delitos.value = data?.data || data || [];
});

const closeAndReset = () => {
  Object.assign(form, emptyForm());
  adolescenteQuery.value = ""; 
  delitoQuery.value = "";
  emit("close");
};

watch(() => props.initialData, (v) => {
  if (!v) return;
  if (v.adolescente) { form.adolescenteId = v.adolescente.id; adolescenteQuery.value = `${v.adolescente.nombre} ${v.adolescente.apellido}`; }
  if (v.delito) { form.delitoId = v.delito.id; delitoQuery.value = v.delito.nombre; }
  Object.keys(form).forEach(k => { if (v[k] !== undefined) form[k] = (typeof v[k] === 'string' && v[k].includes('T')) ? v[k].split('T')[0] : v[k]; });
}, { immediate: true });
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
.modal { background: white; border-radius: 24px; width: min(720px, 95vw); max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.form-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.modal-body { padding: 0 32px 32px 32px; overflow-y: auto; flex: 1; }
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

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

.dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 14px; z-index: 100; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 8px; list-style: none; }
.dropdown li { padding: 10px 14px; cursor: pointer; border-radius: 10px; }
.dropdown li:hover { background: #eff6ff; color: #2563eb; }

.required { color: #ef4444; }
.loader { width: 14px; height: 14px; border: 2px solid #FFF; border-bottom-color: transparent; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; margin-right: 8px; }
@keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>