<template>
  <div class="toolbar">
    <div class="filters">
      <input
        type="text"
        placeholder="Buscar por N° de causa..."
        v-model="localTermino"
        @input="emitChange"
      />

      <input
        type="number"
        min="1"
        placeholder="Adolescente ID"
        v-model.number="localAdolescenteId"
        @input="emitChange"
      />

      <input
        type="number"
        min="1"
        placeholder="Delito ID"
        v-model.number="localDelitoId"
        @input="emitChange"
      />
    </div>

    <button class="btn-primary" @click="$emit('create')">
      + Nuevo Registro
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  termino: { type: String, default: "" },
  adolescenteId: { type: Number, default: null },
  delitoId: { type: Number, default: null },
});

const emit = defineEmits([
  "update:termino",
  "update:adolescenteId",
  "update:delitoId",
  "create",
]);

const localTermino = ref(props.termino);
const localAdolescenteId = ref(props.adolescenteId);
const localDelitoId = ref(props.delitoId);

watch(() => props.termino, v => localTermino.value = v);
watch(() => props.adolescenteId, v => localAdolescenteId.value = v);
watch(() => props.delitoId, v => localDelitoId.value = v);

const emitChange = () => {
  emit("update:termino", localTermino.value || "");
  emit("update:adolescenteId", localAdolescenteId.value || null);
  emit("update:delitoId", localDelitoId.value || null);
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

/* Inputs estilo Familia */
.toolbar input {
  min-width: 180px;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 0.95rem;
  background: #fff;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.toolbar input:focus {
  border-color: rgba(59, 130, 246, 0.55);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
}

/* Botón estilo Familia */
.btn-primary {
  border: none;
  color: white;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  background: linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%);
  box-shadow: 0 14px 28px rgba(29, 78, 216, 0.22);
  transition: transform 0.08s ease, box-shadow 0.15s ease;
}

.btn-primary:hover {
  box-shadow: 0 18px 34px rgba(29, 78, 216, 0.24);
}

.btn-primary:active {
  transform: translateY(1px);
}
</style>
