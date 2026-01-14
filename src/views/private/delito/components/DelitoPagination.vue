<template>
  <div class="pagination">
    <div class="info">
      Mostrando {{ rangeStart }}-{{ rangeEnd }} de {{ total }}
    </div>
    <div class="controls">
      <button
        class="ghost"
        type="button"
        :disabled="currentPage <= 1"
        @click="emitPage(currentPage - 1)"
      >
        Anterior
      </button>

      <button
        v-for="p in pages"
        :key="p"
        class="page"
        :class="{ active: p === currentPage }"
        type="button"
        @click="emitPage(p)"
      >
        {{ p }}
      </button>

      <button
        class="ghost"
        type="button"
        :disabled="currentPage >= totalPages"
        @click="emitPage(currentPage + 1)"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
});

const emit = defineEmits(["update:page"]);

const pages = computed(() => {
  const count = Math.max(props.totalPages, 1);
  // Muestra hasta 5 páginas para no saturar
  return Array.from({ length: count }, (_, i) => i + 1).slice(0, 5);
});

const rangeStart = computed(() => {
  if (props.total === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const rangeEnd = computed(() => {
  if (props.total === 0) return 0;
  return Math.min(props.currentPage * props.pageSize, props.total);
});

const emitPage = (p) => {
  const safe = Math.min(Math.max(p, 1), props.totalPages || 1);
  emit("update:page", safe);
};
</script>

<style scoped>
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 14px 4px 0;
}
.info { font-size: 0.9rem; color: #64748b; }
.controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.ghost, .page {
  padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0;
  background: white; font-size: 0.85rem; cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.ghost:disabled { cursor: not-allowed; opacity: 0.5; }
.page.active {
  border-color: #2563eb; color: #1d4ed8; background: rgba(37, 99, 235, 0.1); font-weight: 600;
}
.page:hover, .ghost:hover:not(:disabled) { background: #f1f5f9; }
</style>