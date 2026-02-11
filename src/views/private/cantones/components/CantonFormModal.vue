<template>
  <transition name="modal-fade">
    <div v-if="open" class="backdrop" @click.self="$emit('close')">
      <div class="modal">
        <header class="modal-header">
          <div>
            <p class="eyebrow">Administración Geográfica</p>
            <h3>
              {{ mode === "edit" ? "Editar cantón" : "Nuevo cantón" }}
            </h3>
          </div>
          <button class="icon-btn" type="button" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        <div v-if="loadingProvincias" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando lista de provincias...</p>
        </div>

        <form v-else class="modal-body" @submit.prevent="submit">
          <div class="section-title">Datos del Cantón</div>
          
          <div class="form-row">
            <label class="field">
              <span>Nombre del Cantón</span>
              <input v-model="form.nombre" type="text" placeholder="Ej: Quito" required />
            </label>

            <label class="field">
              <span>Provincia</span>
              <select v-model.number="form.provinciaId" required>
                <option :value="null" disabled>Seleccione una provincia...</option>
                <option v-for="provincia in listaProvincias" :key="provincia.id" :value="provincia.id">
                  {{ provincia.nombre }}
                </option>
              </select>
            </label>
          </div>

          <div class="actions">
            <button class="ghost" type="button" @click="$emit('close')">
              Cancelar
            </button>
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
import { ref, watch, onMounted } from "vue";
// Importamos el servicio de provincias para la carga interna
import { getProvincias } from "@/service/provincias.service";

const emptyForm = () => ({
  nombre: "",
  provinciaId: null,
});

export default {
  props: {
    open: Boolean,
    mode: String,
    initialData: Object,
    saving: Boolean,
  },
  emits: ["close", "save"],
  setup(props, { emit }) {
    const form = ref(emptyForm());
    const listaProvincias = ref([]);
    const loadingProvincias = ref(false);

    // Función para cargar la lista entera de provincias (sin paginación limitada)
    const loadProvincias = async () => {
      if (listaProvincias.value.length > 0) return;
      loadingProvincias.value = true;
      try {
        // Pedimos un size grande para asegurar la lista completa
        const res = await getProvincias({ size: 1000 });
        listaProvincias.value = res.data?.data || res.data || [];
      } catch (error) {
        console.error("Error cargando provincias:", error);
      } finally {
        loadingProvincias.value = false;
      }
    };

    const syncForm = () => {
      if (props.initialData) {
        form.value = { ...emptyForm(), ...props.initialData };
      } else {
        form.value = emptyForm();
      }
    };

    // Al abrir el modal, cargamos provincias y sincronizamos datos
    watch(
      () => props.open,
      async (isOpen) => {
        if (isOpen) {
          await loadProvincias();
          syncForm();
        }
      },
      { immediate: true }
    );

    const submit = () => {
      emit("save", {
        ...form.value,
        provinciaId: Number(form.value.provinciaId),
      });
    };

    return {
      form,
      listaProvincias,
      loadingProvincias,
      submit,
    };
  },
};
</script>

<style scoped>
.backdrop {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; padding: 24px; z-index: 60;
}

.modal {
  width: min(640px, 100%); background: white; border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column;
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between; padding: 24px 32px;
  background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%); 
  color: white; border-top-left-radius: 20px; border-top-right-radius: 20px;
}

.modal-header h3 { margin: 4px 0 0; font-weight: 700; }
.eyebrow { margin: 0; font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; opacity: 0.8; font-weight: 600; }

.icon-btn {
  background: rgba(255, 255, 255, 0.15); border: none; color: white; width: 36px; height: 36px;
  border-radius: 10px; cursor: pointer; display: grid; place-items: center; transition: background 0.2s;
}
.icon-btn:hover { background: rgba(255, 255, 255, 0.25); }

.modal-body { padding: 32px; display: flex; flex-direction: column; gap: 20px; }

.section-title {
  font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;
  border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; font-size: 0.875rem; color: #334155; font-weight: 500; }

.field input, .field select {
  padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.95rem;
  color: #0f172a; background-color: #f8fafc; transition: all 0.2s;
}

.field input:focus, .field select:focus {
  outline: none; border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.loading-state { padding: 40px; text-align: center; color: #64748b; }
.spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }

.actions {
  display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; padding-top: 20px; border-top: 1px solid #f1f5f9;
}

.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; padding: 12px 24px;
  border-radius: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.ghost {
  background: white; border: 1px solid #cbd5e1; color: #475569; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .actions { flex-direction: column-reverse; }
  .actions button { width: 100%; }
}
</style>