<template>
  <div class="pagination">
    <button
      :disabled="page === 1"
      @click="$emit('change', page - 1)"
    >
      Anterior
    </button>

    <span>
      Página {{ page }} de {{ safeTotalPages }}
    </span>

    <button
      :disabled="page === safeTotalPages"
      @click="$emit('change', page + 1)"
    >
      Siguiente
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

/* Evita "Página 1 de 0" */
const safeTotalPages = computed(() =>
  props.totalPages > 0 ? props.totalPages : 1
);
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
  font-weight: 600;
  color: #334155;
  font-size: 0.92rem;
}

.pagination button {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  color: #0f172a;
  transition: all 0.15s ease;
}

.pagination button:hover:not(:disabled) {
  background: #fff;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}

.pagination button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
