<template>
  <transition name="modal-fade">
    <div v-if="open" class="backdrop" @click.self="$emit('close')">
      <div class="modal">
        
        <header class="modal-header">
          <div>
            <p class="eyebrow">Formulario</p>
            <h3>{{ mode === "edit" ? "Editar adolescente" : "Nuevo registro" }}</h3>
          </div>
          <button class="icon-btn" type="button" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        <div v-if="loadingCatalogs" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando catálogos del sistema...</p>
        </div>

        <form v-else class="modal-body" @submit.prevent="submit">
          <div class="section-title">Ubicación y Grupo</div>
          <div class="form-row">
            <label class="field">
              <span>Centro (CAI)</span>
              <select v-model.number="form.caiId" required>
                <option :value="null" disabled>Seleccione...</option>
                <option v-for="item in catalogs.cais" :key="item.id" :value="item.id">{{ item.nombre }}</option>
              </select>
            </label>
            <label class="field">
              <span>Cantón</span>
              <select v-model.number="form.cantonId" required>
                <option :value="null" disabled>Seleccione...</option>
                <option v-for="item in catalogs.cantones" :key="item.id" :value="item.id">{{ item.nombre }}</option>
              </select>
            </label>
            <label class="field">
              <span>GDO</span>
              <select v-model.number="form.gdosId" required>
                <option :value="null" disabled>Seleccione...</option>
                <option v-for="item in catalogs.gdos" :key="item.id" :value="item.id">{{ item.nombre }}</option>
              </select>
            </label>
          </div>

          <div class="section-title">Datos Personales</div>
          <div class="form-row">
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

          <div class="form-row">
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

          <div class="form-row">
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

          <div class="form-row two-col">
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
          </div>

          <label class="field field-full">
            <span>Observaciones</span>
            <textarea v-model="form.observaciones" rows="2" placeholder="Información adicional relevante..."></textarea>
          </label>

          <div class="actions">
            <button class="ghost" type="button" @click="$emit('close')">Cancelar</button>
            <button class="primary" type="submit" :disabled="saving">
              {{ saving ? "Guardando..." : "Guardar Registro" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
// (El script se mantiene igual al que tenías o el que corregí antes, 
//  solo asegúrate de importar 'reactive', 'ref', 'watch', etc. y los servicios correctamente)
import { ref, reactive, watch } from "vue";
import { getCais } from "../../../../service/cai.service";
import { getNacionalidades } from "../../../../service/nacionalidad.service";
import { getEtnias } from "../../../../service/etnia.service";
import { getCantones } from "../../../../service/cantones.service";
import { getGdos } from "../../../../service/gdos.service";
import { getEstadosCiviles } from "../../../../service/estadoCivil.service"; 

const emptyForm = () => ({
  caiId: null, nacionalidadId: null, estadoCivilId: null, gdosId: null,
  etniaId: null, cantonId: null, nombre: "", apellido: "",
  fecha_nac: "", hijos: 0, fecha_ingr: "", cedula: "",
  hijoPpl: "0", reincide: "0", observaciones: "",
});

export default {
  name: "AdolescenteModal",
  props: {
    open: Boolean, mode: String, initialData: Object, saving: Boolean,
  },
  emits: ["close", "save"],
  setup(props, { emit }) {
    const form = ref(emptyForm());
    const loadingCatalogs = ref(false);
    
    const catalogs = reactive({
      cais: [], nacionalidades: [], etnias: [], cantones: [], gdos: [], estadosCiviles: [], 
    });

    const extractArray = (res) => Array.isArray(res) ? res : (res.data?.data || res.data || []);

    const loadCatalogs = async () => {
      if (catalogs.cais.length > 0) return;
      loadingCatalogs.value = true;
      try {
        const params = { size: 100 };
        const [rCai, rNac, rEtnia, rCan, rGdo, rEst] = await Promise.all([
          getCais(params), getNacionalidades(params), getEtnias(params),
          getCantones(params), getGdos(params), getEstadosCiviles(params) 
        ]);
        catalogs.cais = extractArray(rCai);
        catalogs.nacionalidades = extractArray(rNac);
        catalogs.etnias = extractArray(rEtnia);
        catalogs.cantones = extractArray(rCan);
        catalogs.gdos = extractArray(rGdo);
        catalogs.estadosCiviles = extractArray(rEst);
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      } finally {
        loadingCatalogs.value = false;
      }
    };

    const syncForm = () => {
      form.value = props.initialData ? { ...emptyForm(), ...props.initialData } : emptyForm();
    };

    watch(() => props.open, async (isOpen) => {
      if (isOpen) {
        await loadCatalogs();
        syncForm();
      }
    }, { immediate: true });

    const submit = () => emit("save", { ...form.value });

    return { form, catalogs, loadingCatalogs, submit };
  },
};
</script>

<style scoped>
.backdrop {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; padding: 16px; z-index: 60;
}

.modal {
  width: min(800px, 96vw); background: white; border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; max-height: 90vh;
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between; padding: 24px 32px;
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%); color: white; border-top-left-radius: 20px; border-top-right-radius: 20px;
}
.modal-header h3 { margin: 4px 0 0; font-weight: 700; font-size: 1.4rem; }
.eyebrow { margin: 0; font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; opacity: 0.8; font-weight: 600; }

.icon-btn {
  background: rgba(255, 255, 255, 0.15); border: none; color: white; width: 36px; height: 36px;
  border-radius: 10px; cursor: pointer; display: grid; place-items: center; transition: background 0.2s;
}
.icon-btn:hover { background: rgba(255, 255, 255, 0.25); }

.modal-body { padding: 32px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }

.section-title {
  font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;
  border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 8px;
}

.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.two-col { grid-template-columns: 1fr 1fr; }

.field { display: flex; flex-direction: column; gap: 6px; font-size: 0.875rem; color: #334155; font-weight: 500; }
.field-full { width: 100%; }

.field input, .field select, .field textarea {
  padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.95rem;
  color: #0f172a; background-color: #f8fafc; transition: all 0.2s;
}
.field input:focus, .field select:focus, .field textarea:focus {
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
  background: white; border: 1px solid #cbd5e1; color: #475569; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer;
}

@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
  .actions { flex-direction: column-reverse; }
  .actions button { width: 100%; }
}
</style>