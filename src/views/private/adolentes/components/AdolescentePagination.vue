<template>
  <div class="pagination">
    <button
      class="nav-btn"
      :disabled="page <= 1"
      @click="emitPage(page - 1)"
    >
      Anterior
    </button>

    <div class="pages">
      <button
        v-for="p in pages"
        :key="p"
        class="page-num"
        :class="{ active: p === page }"
        @click="emitPage(p)"
      >
        {{ p }}
      </button>
    </div>

    <button
      class="nav-btn"
      :disabled="page >= totalPages"
      @click="emitPage(page + 1)"
    >
      Siguiente
    </button>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  props: {
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
    total: { type: Number, default: 0 },
  },
  emits: ["update:page"],
  setup(props, { emit }) {
    const pages = computed(() => {
      const count = Math.max(props.totalPages, 1);
      // Lógica simple: muestra todas (puedes mejorarla para mostrar rango tipo 1..5..10)
      return Array.from({ length: count }, (_, i) => i + 1).slice(0, 7); 
    });

    const emitPage = (p) => {
      const safe = Math.min(Math.max(p, 1), props.totalPages || 1);
      emit("update:page", safe);
    };

    return { pages, emitPage };
  },
};
</script>

<style scoped>
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-radius: 14px; background: white; border: 1px solid #e2e8f0;
}

.nav-btn {
  border: 1px solid #e2e8f0; background: white; padding: 8px 16px; border-radius: 10px;
  cursor: pointer; font-weight: 600; color: #0f172a; transition: all 0.2s;
}
.nav-btn:hover:not(:disabled) { background: #f8fafc; }
.nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.pages { display: flex; gap: 6px; }

.page-num {
  width: 36px; height: 36px; border-radius: 8px; border: 1px solid transparent;
  background: transparent; color: #475569; font-weight: 600; cursor: pointer;
  display: grid; place-items: center; transition: all 0.2s;
}
.page-num:hover { background: #f1f5f9; }
.page-num.active {
  background: #eff6ff; color: #2563eb; border-color: #dbeafe;
}
</style>