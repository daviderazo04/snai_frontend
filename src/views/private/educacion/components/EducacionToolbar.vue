<!-- src/views/private/educacion/components/EducacionToolbar.vue -->
<template>
  <div class="toolbar">
    <input
      type="text"
      placeholder="Buscar por id, adolescente, fecha, institución, nivel..."
      :value="search"
      @input="$emit('update:search', $event.target.value)"
    />
    <button class="btn-primary" @click="$emit('create')">+ Nuevo registro</button>
  </div>
</template>

<script setup>
defineProps({
  search: String,
  total: Number,
});
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.toolbar input {
  flex: 1;
  min-width: 260px;
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
