<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="closeAndReset">
      <div class="modal">

        <div class="modal-header">
          <div class="header-text">
            <h3>
              {{ mode === "create"
                ? "Nuevo Registro Jurídico"
                : "Editar Registro Jurídico" }}
            </h3>
            <p class="subtitle">
              Información legal y seguimiento del proceso judicial
            </p>
          </div>

          <button class="btn-close" type="button" @click="closeAndReset">
            ✕
          </button>
        </div>

        <form class="form-content" @submit.prevent="handleSave">
          <div class="modal-body">

            <div class="form-grid">
              <label class="field full-width autocomplete" ref="adolescenteRef">
                <span>Adolescente <span class="required">*</span></span>
                <input
                  v-model="adolescenteQuery"
                  placeholder="Buscar por nombre..."
                  @focus="if (!form.adolescenteId) { showAdolescentes = true; loadAdolescentesDefault(); }"
                />
                <ul v-if="showAdolescentes">
                  <li v-if="loadingAdolescentes">Buscando...</li>
                  <li v-for="a in adolescentes" :key="a.id" @click="selectAdolescente(a)">{{ a.label }}</li>
                </ul>
              </label>

              <label class="field full-width autocomplete" ref="delitoRef">
                <span>Delito <span class="required">*</span></span>
                <input v-model="delitoQuery" placeholder="Buscar delito..." @focus="!form.delitoId && (showDelitos = true)" />
                <ul v-if="showDelitos">
                  <li v-for="d in filteredDelitos" :key="d.id" @click="selectDelito(d)">{{ d.nombre }}</li>
                </ul>
              </label>

              <label class="field full-width">
                <span>N° de Causa <span class="required">*</span></span>
                <input v-model="form.numeroCausa" />
              </label>

              <label class="field"><span>Juez</span><input v-model="form.juez" /></label>
              <label class="field"><span>Fiscal</span><input v-model="form.fiscal" /></label>
              <label class="field"><span>Defensor</span><input v-model="form.defensor" /></label>
              <label class="field"><span>Medidas</span><input v-model="form.medidas" /></label>
            </div>

            <div class="section-divider"></div>

            <h4 class="internal-title">Cómputo de la Pena</h4>
            <div class="form-grid">
              <label class="field"><span>Años</span><input type="number" min="0" v-model.number="form.tiempoAnio" /></label>
              <label class="field"><span>Meses</span><input type="number" min="0" v-model.number="form.tiempoMes" /></label>
              <label class="field"><span>Días</span><input type="number" min="0" v-model.number="form.sentenciaDia" /></label>
            </div>

            <div class="section-divider"></div>

            <h4 class="internal-title">Fechas de Proceso y Beneficios</h4>
            <div class="form-grid">
              <label class="field">
                <span>Fecha Inicio <span class="required">*</span></span>
                <input type="date" v-model="form.fechaInicio" />
              </label>
              <label class="field">
                <span>Fecha Fin (Auto)</span>
                <input type="date" v-model="form.fechaFin" readonly style="background: #f1f5f9; cursor: not-allowed;" />
              </label>
              <label class="field">
                <span>Fecha 60% (Auto)</span>
                <input type="date" v-model="form.fecha60" readonly style="background: #f1f5f9; cursor: not-allowed;" />
              </label>
              <label class="field">
                <span>Fecha 80% (Auto)</span>
                <input type="date" v-model="form.fecha80" readonly style="background: #f1f5f9; cursor: not-allowed;" />
              </label>
            </div>

            <div class="section-divider"></div>

            <h4 class="internal-title">Recursos de Ley</h4>
            <div class="form-grid" style="gap: 20px 16px;">
              <label class="field"><span>Recurso Apelación</span><input v-model="form.recApelMod" /></label>
              <label class="field"><span>Fecha Apelación</span><input type="date" v-model="form.RecApelFecha" /></label>
              
              <label class="field">
                <span>¿Casación?</span>
                <select v-model="form.casacionRecurso">
                  <option value="NO">NO</option>
                  <option value="SI">SI</option>
                </select>
              </label>

              <label class="field">
                <span>Fecha Casación <span v-if="form.casacionRecurso === 'NO'">🔒</span></span>
                <input 
                  type="date" 
                  v-model="form.casacionFecha" 
                  :disabled="form.casacionRecurso === 'NO'"
                  :style="form.casacionRecurso === 'NO' ? 'background: #f1f5f9; color: #94a3b8; cursor: not-allowed;' : ''"
                />
              </label>
            </div>

            <div class="section-divider"></div>

            <div class="form-grid">
              <label class="field"><span>Fecha Egreso Real</span><input type="date" v-model="form.egresoFecha" /></label>
              <label class="field full-width"><span>Motivo Egreso</span><textarea rows="2" v-model="form.egresoMotivo"></textarea></label>
            </div>

          </div>

          <div class="actions">
            <button type="button" class="btn-ghost" @click="closeAndReset">Cancelar</button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="!canSave || saving"
            >
              {{ mode === 'create' ? 'Guardar' : 'Actualizar Registro' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { getAdolescentes } from "@/service/adolescente.service";
import { getDelitos } from "@/service/delito.service";

const props = defineProps({ open: Boolean, mode: String, initialData: Object, saving: Boolean });
const emit = defineEmits(["close", "save"]);

const emptyForm = () => ({
  adolescenteId: null, delitoId: null, numeroCausa: "", juez: "", fiscal: "", defensor: "",
  medidas: "", boletaPreventivo: "", boletaCarcel: "", fechaInicio: "", fechaAudiencia: "",
  fechaSentencia: "", tiempoAnio: 0, tiempoMes: 0, sentenciaDia: 0, fechaFin: "",
  fecha60: "", fecha80: "", recApelMod: "", RecApelFecha: "", casacionRecurso: "NO",
  casacionFecha: "", egresoFecha: "", egresoMotivo: "",
});

const form = reactive(emptyForm());
const adolescenteQuery = ref("");
const delitoQuery = ref("");

// FUNCIÓN PARA LIMPIAR TODO
const closeAndReset = () => {
  Object.assign(form, emptyForm()); // Limpia el objeto reactivo
  adolescenteQuery.value = "";      // Limpia el buscador de adolescentes
  delitoQuery.value = "";           // Limpia el buscador de delitos
  emit("close");                    // Avisa al padre que cierre
};

/* CÁLCULO DE FECHAS */
const calculateDates = () => {
  if (!form.fechaInicio) return;
  const start = new Date(form.fechaInicio + 'T12:00:00');
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + (form.tiempoAnio || 0));
  end.setMonth(end.getMonth() + (form.tiempoMes || 0));
  end.setDate(end.getDate() + (form.sentenciaDia || 0));
  form.fechaFin = end.toISOString().split('T')[0];
  const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
  if (diffDays > 0) {
    const d60 = new Date(start); d60.setDate(d60.getDate() + Math.floor(diffDays * 0.6));
    form.fecha60 = d60.toISOString().split('T')[0];
    const d80 = new Date(start); d80.setDate(d80.getDate() + Math.floor(diffDays * 0.8));
    form.fecha80 = d80.toISOString().split('T')[0];
  }
};

watch([() => form.fechaInicio, () => form.tiempoAnio, () => form.tiempoMes, () => form.sentenciaDia], calculateDates);

/* LÓGICA DE AUTOCOMPLETE */
const adolescentes = ref([]); const delitos = ref([]);
const showAdolescentes = ref(false); const showDelitos = ref(false);
const loadingAdolescentes = ref(false);

const loadDelitos = async () => { try { const { data } = await getDelitos(); delitos.value = data?.data ?? data ?? []; } catch (e) {} };
onMounted(loadDelitos);

let timeout = null;
watch(adolescenteQuery, (q) => {
  clearTimeout(timeout); 
  if (!q || form.adolescenteId) return; // Evita buscar si ya seleccionamos uno
  timeout = setTimeout(async () => {
    loadingAdolescentes.value = true;
    try {
      const res = await getAdolescentes({ nombre: q, page: 1, size: 5 });
      const data = res.data?.data || res.data?.items || [];
      adolescentes.value = data.map(a => ({ id: a.id, label: `${a.nombre} ${a.apellido}`.trim() }));
    } finally { loadingAdolescentes.value = false; }
  }, 300);
});

const loadAdolescentesDefault = async () => {
  loadingAdolescentes.value = true;
  try {
    const res = await getAdolescentes({ page: 1, size: 10 });
    const data = res.data?.data || res.data?.items || [];
    adolescentes.value = data.map(a => ({ id: a.id, label: `${a.nombre} ${a.apellido}`.trim() }));
  } finally { loadingAdolescentes.value = false; }
};

const filteredDelitos = computed(() => delitos.value.filter(d => d.nombre.toLowerCase().includes(delitoQuery.value.toLowerCase())));
const selectAdolescente = (a) => { form.adolescenteId = a.id; adolescenteQuery.value = a.label; showAdolescentes.value = false; };
const selectDelito = (d) => { form.delitoId = d.id; delitoQuery.value = d.nombre; showDelitos.value = false; };

/* CARGA DE DATOS PARA EDICIÓN */
watch(() => props.initialData, (v) => {
  if (!v) {
    Object.assign(form, emptyForm());
    adolescenteQuery.value = "";
    delitoQuery.value = "";
    return;
  }
  if (v.adolescente) { form.adolescenteId = v.adolescente.id; adolescenteQuery.value = `${v.adolescente.nombre} ${v.adolescente.apellido}`; }
  if (v.delito) { form.delitoId = v.delito.id; delitoQuery.value = v.delito.nombre; }
  Object.keys(form).forEach(k => { if (k.includes("fecha") && v[k]) form[k] = v[k].slice(0, 10); else if (v[k] !== undefined) form[k] = v[k]; });
}, { immediate: true });

const canSave = computed(() => form.adolescenteId && form.delitoId && form.numeroCausa && form.fechaInicio);

const handleSave = () => { 
    if (canSave.value) {
        emit("save", { ...form });
        // Opcional: limpiar después de guardar con éxito
        // closeAndReset(); 
    }
};

const adolescenteRef = ref(null); const delitoRef = ref(null);
const handleClickOutside = (e) => {
  if (adolescenteRef.value && !adolescenteRef.value.contains(e.target)) showAdolescentes.value = false;
  if (delitoRef.value && !delitoRef.value.contains(e.target)) showDelitos.value = false;
};
onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
</script>

<style scoped>
/* (Se mantienen tus estilos exactamente iguales a la versión anterior) */
*, *::before, *::after { box-sizing: border-box; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; padding: 16px; z-index: 60; }
.modal { width: min(600px, 94vw); background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1); border: 1px solid rgba(255, 255, 255, 0.8); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 24px 24px 0 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-shrink: 0; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }
.btn-close { background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 50%; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: all 0.2s; margin-top: -8px; margin-right: -8px; }
.btn-close:hover { background: #f1f5f9; color: #ef4444; }
.form-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field.full-width { grid-column: 1 / -1; }
.field span { font-size: 0.8rem; font-weight: 600; color: #334155; margin-left: 2px; }
.required { color: #ef4444; }
.field input, .field textarea, .field select { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; font-size: 0.95rem; color: #0f172a; background: #f8fafc; transition: all 0.2s ease; font-family: inherit; }
.field select { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; cursor: pointer; }
.field input:focus, .field textarea:focus, .field select:focus { background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); position: relative; z-index: 2; }
.actions { display: flex; justify-content: flex-end; gap: 12px; padding: 0 24px 24px 24px; background: transparent; flex-shrink: 0; }
.actions button { padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.2s ease; }
.btn-ghost { border: 1px solid transparent; background: transparent; color: #64748b; }
.btn-ghost:hover { background: #f1f5f9; color: #334155; }
.btn-primary { border: none; color: white; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.btn-primary:hover:not(:disabled) { opacity: 0.95; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.2); }

.section-divider { height: 1px; background: #f1f5f9; margin: 24px 0; }
.internal-title { font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 12px; font-weight: 800; }

@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.autocomplete { position: relative; }
.autocomplete ul { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15); padding: 6px 0; z-index: 10; max-height: 220px; overflow-y: auto; }
.autocomplete ul li { padding: 10px 16px; cursor: pointer; font-size: 0.9rem; color: #0f172a; transition: background 0.15s ease; }
.autocomplete ul li:hover { background: #f1f5f9; }
</style>