<!-- src/views/private/salud/components/SaludPagination.vue -->
<template>
  <div class="pagination">
    <button
      :disabled="currentPage === 1"
      @click="$emit('update:page', currentPage - 1)"
    >
      Anterior
    </button>

    <span>Página {{ currentPage }} de {{ totalPages }}</span>

    <button
      :disabled="currentPage === totalPages"
      @click="$emit('update:page', currentPage + 1)"
    >
      Siguiente
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentPage: Number,
  totalPages: Number,
});
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.pagination span {
  font-weight: 700;
  color: #334155;
  font-size: 0.92rem;
}

.pagination button {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
  color: #0f172a;
  transition: transform 0.08s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.pagination button:hover:not(:disabled) {
  background: #fff;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}

.pagination button:active:not(:disabled) {
  transform: translateY(1px);
}

.pagination button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
