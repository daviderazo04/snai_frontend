<template>
  <transition name="modal-fade">
    <div v-if="open" class="backdrop" @click.self="$emit('close')">
      <div class="modal">
        <header class="modal-header">
          <div>
            <p class="eyebrow">Formulario</p>
            <h3>
              {{ mode === "edit" ? "Editar canton" : "Nuevo canton" }}
            </h3>
          </div>
          <button class="icon-btn" type="button" @click="$emit('close')">
            X
          </button>
        </header>

        <form class="modal-body" @submit.prevent="submit">
          <label class="field">
            <span>Nombre</span>
            <input v-model="form.nombre" type="text" required />
          </label>

          <label class="field">
            <span>Provincia</span>
            <select v-model.number="form.provinciaId" required>
              <option disabled value="">Seleccione una provincia</option>
              <option v-for="provincia in provincias" :key="provincia.id" :value="provincia.id">
                {{ provincia.nombre }}
              </option>
            </select>
          </label>

          <div class="actions">
            <button class="ghost" type="button" @click="$emit('close')">
              Cancelar
            </button>
            <button class="primary" type="submit" :disabled="saving">
              {{ saving ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, watch } from "vue";

const emptyForm = () => ({
  nombre: "",
  provinciaId: "",
});

export default {
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "create",
    },
    initialData: {
      type: Object,
      default: null,
    },
    provincias: {
      type: Array,
      default: () => [],
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "save"],
  setup(props, { emit }) {
    const form = ref(emptyForm());

    const syncForm = () => {
      if (props.initialData) {
        form.value = {
          ...emptyForm(),
          ...props.initialData,
        };
      } else {
        form.value = emptyForm();
      }
    };

    watch(
      () => [props.open, props.initialData],
      () => {
        if (props.open) {
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
      submit,
    };
  },
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  z-index: 50;
}

.modal {
  width: min(640px, 100%);
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(120deg, #1e293b, #2563eb);
  color: white;
}

.modal-header h3 {
  margin: 4px 0 0;
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.75;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
}

.modal-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: #475569;
}

.field input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
}

.field select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  background: white;
}

.actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.primary:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.ghost {
  background: #f1f5f9;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .modal-body {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .actions button {
    width: 100%;
  }
}
</style>
