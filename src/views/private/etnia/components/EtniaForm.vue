<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  modelValue: Object,
  loading: Boolean
});

const emit = defineEmits(['submit']);

const form = reactive({
  nombre: ''
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.nombre = val.nombre ?? '';
    }
  },
  { immediate: true }
);

const submit = () => {
  emit('submit', { ...form });
};
</script>

<template>
  <form @submit.prevent="submit">
    <div>
      <label>Nombre</label>
      <input
        v-model="form.nombre"
        type="text"
        required
      />
    </div>

    <button type="submit" :disabled="loading">
      Guardar
    </button>
  </form>
</template>
