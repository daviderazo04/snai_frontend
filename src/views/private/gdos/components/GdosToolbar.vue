<template>
  <div class="toolbar">
    <div class="title-block">
      <div>
        <h2>Listado de G2</h2>
        <p class="subtitle">{{ total }} registros disponibles</p>
      </div>
      <button class="primary" type="button" @click="$emit('create')">
        Nuevo G2
      </button>
    </div>

    <div class="filters">
      <label class="field">
        <span class="label">Buscar</span>
        <input
          type="search"
          :value="search"
          placeholder="Nombre del grupo G2"
          @input="$emit('update:search', $event.target.value)"
        />
      </label>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    search: {
      type: String,
      default: "",
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:search", "create"],
};
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.title-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title-block h2 {
  margin: 0 0 4px;
  font-size: 1.2rem;
  color: #0f172a;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
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
  background: white;
  font-size: 0.95rem;
  color: #0f172a;
}

.field input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

@media (max-width: 720px) {
  .title-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .primary {
    width: 100%;
  }
}
</style>
