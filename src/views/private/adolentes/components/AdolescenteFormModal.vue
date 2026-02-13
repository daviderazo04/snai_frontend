<template>
  <transition name="modal-fade">
    <div v-if="open" class="backdrop" @click.self="$emit('close')">
      <div class="modal">
        
        <header class="modal-header">
          <div>
            <p class="eyebrow">Formulario</p>
            <h3>{{ mode === 'edit' ? 'Editar adolescente' : 'Nuevo registro' }}</h3>
          </div>
          <button class="icon-btn" type="button" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div v-if="loadingCatalogs" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando catálogos del sistema...</p>
        </div>

        <form v-else class="modal-body" @submit.prevent="submit">
          
          <div class="section-title">Datos Personales</div>
          
          <div class="form-row three-col">
            <label class="field">
              <span>Nombre</span>
              <input v-model="form.nombre" type="text" placeholder="Nombres completos" required />
            </label>
            <label class="field">
              <span>Apellido</span>
              <input v-model="form.apellido" type="text" placeholder="Apellidos completos" required />
            </label>
            <label class="field">
              <span>Cédula</span>
              <input v-model="form.cedula" type="text" maxlength="10" placeholder="10 dígitos" required />
            </label>
          </div>

          <div class="form-row three-col">
            <label class="field">
              <span>Nacionalidad</span>
              <select v-model.number="form.nacionalidadId" required>
                <option :value="null" disabled>Seleccione...</option>
                <option v-for="item in catalogs.nacionalidades" :key="item.id" :value="item.id">{{ item.nombre }}</option>
              </select>
            </label>
            <label class="field">
              <span>Etnia</span>
              <select v-model.number="form.etniaId" required>
                <option :value="null" disabled>Seleccione...</option>
                <option v-for="item in catalogs.etnias" :key="item.id" :value="item.id">{{ item.nombre }}</option>
              </select>
            </label>
            <label class="field">
              <span>Estado Civil</span>
              <select v-model.number="form.estadoCivilId" required>
                <option :value="null" disabled>Seleccione...</option>
                <option v-for="item in catalogs.estadosCiviles" :key="item.id" :value="item.id">{{ item.nombre }}</option>
              </select>
            </label>
          </div>

          <div class="form-row three-col">
            <label class="field">
              <span>F. Nacimiento</span>
              <input v-model="form.fecha_nac" type="date" required />
            </label>
            <label class="field">
              <span>F. Ingreso</span>
              <input v-model="form.fecha_ingr" type="date" required />
            </label>
            <label class="field">
              <span>Hijos</span>
              <input v-model.number="form.hijos" type="number" min="0" required />
            </label>
          </div>

          <div class="form-row special-row">
            <label class="field">
              <span>¿Tiene padre PPL?</span>
              <select v-model="form.hijoPpl" required>
                <option value="0">No</option>
                <option value="1">Sí</option>
              </select>
            </label>
            <label class="field">
              <span>¿Es Reincidente?</span>
              <select v-model="form.reincide" required>
                <option value="0">No</option>
                <option value="1">Sí</option>
              </select>
            </label>
            <label class="field">
              <span>Observaciones</span>
              <input v-model="form.observaciones" type="text" placeholder="Información adicional relevante..." />
            </label>
          </div>

          <div class="section-title">Ubicación y Grupo</div>
          
          <div class="form-row full-width">
            <div class="field">
              <span>Centro (CAI) <span class="required">*</span></span>
              <CaiAutocomplete 
                v-model="form.caiId"
                placeholder="Escriba para buscar el centro de origen..."
              />
            </div>
          </div>

          <div class="form-row two-col">
            <label class="field">
              <span>Cantón</span>
              <select v-model.number="form.cantonId" required>
                <option :value="null" disabled>Seleccione...</option>
                <option v-for="item in catalogs.cantones" :key="item.id" :value="item.id">{{ item.nombre }}</option>
              </select>
            </label>
            <label class="field">
              <span>GDO (Grupo Delictivo)</span>
              <select v-model.number="form.gdosId" required>
                <option :value="null" disabled>Seleccione...</option>
                <option v-for="item in catalogs.gdos" :key="item.id" :value="item.id">{{ item.nombre }}</option>
              </select>
            </label>
          </div>

          <div class="actions">
            <button class="ghost" type="button" @click="$emit('close')">Cancelar</button>
            <button class="primary" type="submit" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar Registro' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import CaiAutocomplete from "@/components/CAIs/CaiAutocomplete.vue";
import { getNacionalidades } from "../../../../service/nacionalidad.service";
import { getEtnias } from "../../../../service/etnia.service";
import { getCantones } from "../../../../service/cantones.service";
import { getGdos } from "../../../../service/gdos.service";
import { getEstadosCiviles } from "../../../../service/estadoCivil.service"; 

const props = defineProps({
  open: Boolean,
  mode: String,
  initialData: Object,
  saving: Boolean,
});

const emit = defineEmits(['close', 'save']);

const emptyForm = () => ({
  caiId: null, nacionalidadId: null, estadoCivilId: null, gdosId: null,
  etniaId: null, cantonId: null, nombre: "", apellido: "",
  fecha_nac: "", hijos: 0, fecha_ingr: "", cedula: "",
  hijoPpl: "0", reincide: "0", observaciones: "",
});

const form = ref(emptyForm());
const loadingCatalogs = ref(false);
const catalogs = reactive({
  nacionalidades: [], etnias: [], cantones: [], gdos: [], estadosCiviles: [], 
});

const extractArray = (res) => Array.isArray(res) ? res : (res.data?.data || res.data || []);

const loadCatalogs = async () => {
  // Evitamos cargar si ya están presentes (excepto CAI que ahora es autónomo)
  if (catalogs.nacionalidades.length > 0) return;
  loadingCatalogs.value = true;
  try {
    const params = { size: 100 };
    const [rNac, rEtnia, rCan, rGdo, rEst] = await Promise.all([
      getNacionalidades(params), getEtnias(params),
      getCantones(params), getGdos(params), getEstadosCiviles(params) 
    ]);
    catalogs.nacionalidades = extractArray(rNac);
    catalogs.etnias = extractArray(rEtnia);
    catalogs.cantones = extractArray(rCan);
    catalogs.gdos = extractArray(rGdo);
    catalogs.estadosCiviles = extractArray(rEst);
  } catch (error) {
    console.error("Error catálogos:", error);
  } finally {
    loadingCatalogs.value = false;
  }
};

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await loadCatalogs();
    if (props.initialData) {
      // Sincronizamos los datos iniciales, incluyendo el caiId
      form.value = { ...emptyForm(), ...props.initialData };
    } else {
      form.value = emptyForm();
    }
  }
}, { immediate: true });

const submit = () => {
  // Validamos que el CAI esté seleccionado ya que el componente emite el ID
  if (!form.value.caiId) {
    alert("Por favor seleccione un Centro (CAI)");
    return;
  }
  emit('save', { ...form.value });
};
</script>

<style scoped>
.backdrop {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; padding: 12px; z-index: 60;
}

.modal {
  width: min(900px, 98vw); background: white; border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; 
  max-height: 96vh;
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between; padding: 24px 32px;
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%); color: white; 
  border-top-left-radius: 20px; border-top-right-radius: 20px;
}

.modal-header h3 { margin: 4px 0 0; font-weight: 700; font-size: 1.4rem; }
.eyebrow { margin: 0; font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; opacity: 0.8; font-weight: 600; }

/* Botón de cerrar restaurado al estilo original */
.icon-btn {
  background: rgba(255, 255, 255, 0.15); border: none; color: white; width: 36px; height: 36px;
  border-radius: 10px; cursor: pointer; display: grid; place-items: center; transition: background 0.2s;
}
.icon-btn:hover { background: rgba(255, 255, 255, 0.25); }

.modal-body { 
  padding: 24px 32px; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  overflow-y: auto;
}

.section-title {
  font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;
  border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 8px;
}

.form-row { display: grid; gap: 16px; width: 100%; }
.three-col { grid-template-columns: repeat(3, 1fr); }
.two-col { grid-template-columns: 1fr 1fr; }
.special-row { grid-template-columns: 1fr 1fr 1.5fr; }
.full-width { grid-template-columns: 1fr; }

.field { display: flex; flex-direction: column; gap: 6px; font-size: 0.875rem; color: #334155; font-weight: 500; }

.field input, .field select {
  padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.95rem;
  color: #0f172a; background-color: #f8fafc; transition: all 0.2s;
}

.field input:focus, .field select:focus {
  outline: none; border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.actions {
  display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;
}

.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; padding: 12px 24px;
  border-radius: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.ghost {
  background: white; border: 1px solid #cbd5e1; color: #475569; padding: 12px 24px; 
  border-radius: 12px; font-weight: 600; cursor: pointer;
}

.loading-state { padding: 40px; text-align: center; }
.spinner {
  width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6;
  border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>