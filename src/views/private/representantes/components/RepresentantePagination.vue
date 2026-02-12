<template>
  <div class="pagination">
    <div class="left">
      <button
        :disabled="currentPage <= 1"
        @click="emitPage(currentPage - 1)"
      >
        Anterior
      </button>

      <span>Página {{ currentPage }} de {{ safeTotalPages }}</span>

      <button
        :disabled="currentPage >= safeTotalPages"
        @click="emitPage(currentPage + 1)"
      >
        Siguiente
      </button>
    </div>

    <div class="right">
      <span class="info">Mostrando {{ rangeStart }}-{{ rangeEnd }} de {{ total }}</span>
      <label class="size-control">
        <span>Tamaño</span>
        <select :value="pageSize" @change="emitSize($event.target.value)">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  total: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:page", "update:size"]);

const safeTotalPages = computed(() => Math.max(props.totalPages || 1, 1));
const safePageSize = computed(() => Math.max(props.pageSize || 1, 1));

const rangeStart = computed(() => {
  if (props.total <= 0) return 0;
  return (props.currentPage - 1) * safePageSize.value + 1;
});

const rangeEnd = computed(() => {
  if (props.total <= 0) return 0;
  return Math.min(props.currentPage * safePageSize.value, props.total);
});

const emitPage = (page) => {
  const safePage = Math.min(Math.max(page, 1), safeTotalPages.value);
  emit("update:page", safePage);
};

const emitSize = (size) => {
  const parsed = Number(size);
  emit("update:size", Number.isFinite(parsed) && parsed > 0 ? parsed : 10);
};
</script>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 10px;
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
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}

.pagination button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.info {
  font-weight: 600 !important;
  color: #64748b !important;
}

.size-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #334155;
}

.size-control select {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  font-weight: 600;
}
</style>
