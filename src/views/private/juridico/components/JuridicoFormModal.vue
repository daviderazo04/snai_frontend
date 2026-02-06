<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">

        <!-- Header -->
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

          <button class="btn-close" type="button" @click="$emit('close')">
            ✕
          </button>
        </div>

        <!-- Form -->
        <form class="form-content" @submit.prevent="handleSave">
          <div class="modal-body">

            <!-- Datos generales -->
            <div class="form-grid">

              <!-- Adolescente -->
              <label class="field full-width autocomplete" ref="adolescenteRef">
                <span>Adolescente <span class="required">*</span></span>

                <input
                  v-model="adolescenteQuery"
                  placeholder="Buscar por nombre..."
                  @focus="
                    if (!form.adolescenteId) {
                      showAdolescentes = true;
                      loadAdolescentesDefault();
                    }
                  "
                />

                <ul v-if="showAdolescentes">
                  <li v-if="loadingAdolescentes">Buscando...</li>

                  <li
                    v-for="a in adolescentes"
                    :key="a.id"
                    @click="selectAdolescente(a)"
                  >
                    {{ a.label }}
                  </li>

                  <li v-if="!loadingAdolescentes && !adolescentes.length">
                    Sin resultados
                  </li>
                </ul>
              </label>

              <!-- Delito -->
              <label class="field full-width autocomplete" ref="delitoRef">
                <span>Delito <span class="required">*</span></span>

                <input
                  v-model="delitoQuery"
                  placeholder="Buscar delito..."
                  @focus="!form.delitoId && (showDelitos = true)"
                />

                <ul v-if="showDelitos">
                  <li
                    v-for="d in filteredDelitos"
                    :key="d.id"
                    @click="selectDelito(d)"
                  >
                    {{ d.nombre }}
                  </li>

                  <li v-if="!filteredDelitos.length">
                    Sin resultados
                  </li>
                </ul>
              </label>

              <label class="field full-width">
                <span>N° de Causa <span class="required">*</span></span>
                <input v-model="form.numeroCausa" />
              </label>

              <label class="field">
                <span>Juez</span>
                <input v-model="form.juez" />
              </label>

              <label class="field">
                <span>Fiscal</span>
                <input v-model="form.fiscal" />
              </label>

              <label class="field">
                <span>Defensor</span>
                <input v-model="form.defensor" />
              </label>
            </div>

            <!-- Medidas -->
            <div class="form-grid">
              <label class="field">
                <span>Medidas</span>
                <input v-model="form.medidas" />
              </label>

              <label class="field">
                <span>Boleta Preventivo</span>
                <input v-model="form.boletaPreventivo" />
              </label>

              <label class="field">
                <span>Boleta Cárcel</span>
                <input v-model="form.boletaCarcel" />
              </label>
            </div>

            <!-- Fechas -->
            <div class="form-grid">
              <label class="field">
                <span>Fecha Inicio <span class="required">*</span></span>
                <input type="date" v-model="form.fechaInicio" />
              </label>

              <label class="field">
                <span>Fecha Audiencia</span>
                <input type="date" v-model="form.fechaAudiencia" />
              </label>

              <label class="field">
                <span>Fecha Sentencia</span>
                <input type="date" v-model="form.fechaSentencia" />
              </label>

              <label class="field">
                <span>Fecha Fin</span>
                <input type="date" v-model="form.fechaFin" />
              </label>

              <label class="field">
                <span>Fecha 60%</span>
                <input type="date" v-model="form.fecha60" />
              </label>

              <label class="field">
                <span>Fecha 80%</span>
                <input type="date" v-model="form.fecha80" />
              </label>
            </div>

            <!-- Sentencia -->
            <div class="form-grid">
              <label class="field">
                <span>Años</span>
                <input type="number" min="0" v-model.number="form.tiempoAnio" />
              </label>

              <label class="field">
                <span>Meses</span>
                <input type="number" min="0" v-model.number="form.tiempoMes" />
              </label>

              <label class="field">
                <span>Días</span>
                <input type="number" min="0" v-model.number="form.sentenciaDia" />
              </label>
            </div>

            <!-- Recursos -->
            <div class="form-grid">
              <label class="field">
                <span>Recurso Apelación</span>
                <input v-model="form.recApelMod" />
              </label>

              <label class="field">
                <span>Fecha Apelación</span>
                <input type="date" v-model="form.RecApelFecha" />
              </label>

              <label class="field">
                <span>Casación</span>
                <input v-model="form.casacionRecurso" />
              </label>

              <label class="field">
                <span>Fecha Casación</span>
                <input type="date" v-model="form.casacionFecha" />
              </label>
            </div>

            <!-- Egreso -->
            <div class="form-grid">
              <label class="field">
                <span>Fecha Egreso</span>
                <input type="date" v-model="form.egresoFecha" />
              </label>

              <label class="field full-width">
                <span>Motivo Egreso</span>
                <textarea rows="3" v-model="form.egresoMotivo"></textarea>
              </label>
            </div>

          </div>

          <!-- Actions -->
          <div class="actions">
            <button type="button" class="btn-ghost" @click="$emit('close')">
              Cancelar
            </button>

            <button
              type="submit"
              class="btn-primary"
              :disabled="!canSave || saving"
            >
              Guardar
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

const props = defineProps({
  open: Boolean,
  mode: String,
  initialData: Object,
  saving: Boolean,
});

const emit = defineEmits(["close", "save"]);

/* ================= FORM ================= */

const emptyForm = () => ({
  adolescenteId: null,
  delitoId: null,
  numeroCausa: "",
  juez: "",
  fiscal: "",
  defensor: "",
  medidas: "",
  boletaPreventivo: "",
  boletaCarcel: "",
  fechaInicio: "",
  fechaAudiencia: "",
  fechaSentencia: "",
  tiempoAnio: 0,
  tiempoMes: 0,
  sentenciaDia: 0,
  fechaFin: "",
  fecha60: "",
  fecha80: "",
  recApelMod: "",
  RecApelFecha: "",
  casacionRecurso: "",
  casacionFecha: "",
  egresoFecha: "",
  egresoMotivo: "",
});

const form = reactive(emptyForm());

/* ================= AUTOCOMPLETE ================= */

const adolescenteQuery = ref("");
const delitoQuery = ref("");

const adolescentes = ref([]);
const delitos = ref([]);

const showAdolescentes = ref(false);
const showDelitos = ref(false);

const loadingAdolescentes = ref(false);
const loadingDelitos = ref(false);

/* ================= LOAD DELITOS ================= */

const loadDelitos = async () => {
  loadingDelitos.value = true;
  try {
    const { data } = await getDelitos();
    delitos.value = data?.data ?? data ?? [];
  } finally {
    loadingDelitos.value = false;
  }
};

onMounted(loadDelitos);

/* ================= SEARCH ADOLESCENTES ================= */

let adolescenteTimeout = null;

watch(adolescenteQuery, (q) => {
  clearTimeout(adolescenteTimeout);

  // 👇 si está vacío, no borrar lo que ya cargamos
  if (!q) return;

  adolescenteTimeout = setTimeout(async () => {
    loadingAdolescentes.value = true;
    try {
      const res = await getAdolescentes({
        nombre: q,
        page: 1,
        size: 5,
      });

      const payload = res.data || {};
      const data = payload.data || payload.items || [];

      adolescentes.value = data.map(a => ({
        id: a.id,
        nombre: a.nombre ?? "",
        apellido: a.apellido ?? "",
        label: `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim(),
      }));
    } catch (err) {
      adolescentes.value = [];
    } finally {
      loadingAdolescentes.value = false;
    }
  }, 300);
});



const loadAdolescentesDefault = async () => {
  loadingAdolescentes.value = true;
  try {
    const res = await getAdolescentes({
      page: 1,
      size: 10,
    });

    const payload = res.data || {};
    const data = payload.data || payload.items || [];

    adolescentes.value = data.map(a => ({
      id: a.id,
      nombre: a.nombre ?? "",
      apellido: a.apellido ?? "",
      label: `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim(),
    }));
  } catch (e) {
    adolescentes.value = [];
  } finally {
    loadingAdolescentes.value = false;
  }
};


/* ================= FILTER DELITOS ================= */

const filteredDelitos = computed(() =>
  delitos.value.filter(d =>
    d.nombre.toLowerCase().includes(delitoQuery.value.toLowerCase())
  )
);

/* ================= SELECT ================= */

const selectAdolescente = (a) => {
  form.adolescenteId = a.id;
  //adolescenteQuery.value = `${a.nombre} ${a.apellido}`;
  adolescenteQuery.value = a.label;
  showAdolescentes.value = false;
};

const selectDelito = (d) => {
  form.delitoId = d.id;
  delitoQuery.value = d.nombre;
  showDelitos.value = false;
};

/* ================= EDIT MODE ================= */

watch(
  () => props.initialData,
  (v) => {
    Object.assign(form, emptyForm());
    adolescenteQuery.value = "";
    delitoQuery.value = "";

    if (!v) return;

    if (v.adolescente) {
      form.adolescenteId = v.adolescente.id;
      adolescenteQuery.value = `${v.adolescente.nombre} ${v.adolescente.apellido}`;
    }

    if (v.delito) {
      form.delitoId = v.delito.id;
      delitoQuery.value = v.delito.nombre;
    }

    Object.keys(form).forEach((k) => {
      if (k.includes("fecha") && v[k]) form[k] = v[k].slice(0, 10);
      else if (v[k] !== undefined) form[k] = v[k];
    });
  },
  { immediate: true }
);

/* ================= SAVE ================= */

const canSave = computed(() =>
  form.adolescenteId &&
  form.delitoId &&
  form.numeroCausa &&
  form.fechaInicio
);

const handleSave = () => {
  if (!canSave.value) return;
  emit("save", { ...form });
};



const adolescenteRef = ref(null);
const delitoRef = ref(null);

const handleClickOutside = (e) => {
  if (
    adolescenteRef.value &&
    !adolescenteRef.value.contains(e.target)
  ) {
    showAdolescentes.value = false;
  }

  if (
    delitoRef.value &&
    !delitoRef.value.contains(e.target)
  ) {
    showDelitos.value = false;
  }
};


onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});


</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal, .modal-fade-leave-active .modal { transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fade-enter-from .modal { transform: scale(0.95) translateY(10px); }
.modal-fade-leave-to .modal { transform: scale(0.98) translateY(10px); }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 60;
}

.modal {
  width: min(600px, 94vw); 
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
.subtitle { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }

.btn-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-top: -8px;
  margin-right: -8px;
}
.btn-close:hover { background: #f1f5f9; color: #ef4444; }

.form-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }

.loading-state { 
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  padding: 40px; color: #64748b; gap: 10px;
}
.spinner {
  width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #2563eb;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field.full-width { grid-column: 1 / -1; }
.field span { font-size: 0.8rem; font-weight: 600; color: #334155; margin-left: 2px; }
.required { color: #ef4444; }

.field input, .field textarea, .field select {
  width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0;
  outline: none; font-size: 0.95rem; color: #0f172a; background: #f8fafc;
  transition: all 0.2s ease; font-family: inherit;
}

.field select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; cursor: pointer;
}

.field input:focus, .field textarea:focus, .field select:focus {
  background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); position: relative; z-index: 2;
}

.actions {
  display: flex; justify-content: flex-end; gap: 12px; padding: 0 24px 24px 24px; background: transparent; flex-shrink: 0;
}

.actions button { padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.2s ease; }
.btn-ghost { border: 1px solid transparent; background: transparent; color: #64748b; }
.btn-ghost:hover { background: #f1f5f9; color: #334155; }
.btn-primary { border: none; color: white; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.btn-primary:hover:not(:disabled) { opacity: 0.95; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.2); }

@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.autocomplete {
  position: relative;
}

/* Input encima del dropdown */
.autocomplete input {
  position: relative;
  z-index: 2;
}

/* Lista desplegable */
.autocomplete ul {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;

  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);

  padding: 6px 0;
  z-index: 10;

  max-height: 220px;
  overflow-y: auto;

  animation: fadeDown 0.15s ease-out;
}

/* Items */
.autocomplete ul li {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #0f172a;
  transition: background 0.15s ease;
}

/* Hover */
.autocomplete ul li:hover {
  background: #f1f5f9;
}

/* Estado vacío / loading */
.autocomplete ul li:first-child:only-child {
  color: #64748b;
  cursor: default;
}

/* Scroll bonito */
.autocomplete ul::-webkit-scrollbar {
  width: 6px;
}
.autocomplete ul::-webkit-scrollbar-thumb {
  background: #cbd5f5;
  border-radius: 10px;
}
.autocomplete ul::-webkit-scrollbar-track {
  background: transparent;
}

/* Animación */
@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>