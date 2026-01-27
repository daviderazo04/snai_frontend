<!-- src/views/private/educacion/components/EducacionToolbar.vue -->
<template>
  <div class="toolbar">
    <div class="title-block">
      <div>
        <h2>Listado de Educación</h2>
        <p class="subtitle">{{ total }} registros disponibles</p>
      </div>
      <button class="btn-primary" type="button" @click="$emit('create')">
        + Nuevo registro
      </button>
    </div>

    <div class="filters">
      <label class="field">
        <span class="label">Buscar adolescente</span>
        <input
          type="search"
          placeholder="Nombre o cédula"
          :value="search"
          @input="$emit('update:search', $event.target.value)"
        />
      </label>

      <label class="field">
        <span class="label">Estudia</span>
        <select :value="estudia" @change="$emit('update:estudia', $event.target.value)">
          <option value="">Todos</option>
          <option value="1">Sí estudia</option>
          <option value="0">No estudia</option>
        </select>
      </label>

      <label class="field">
        <span class="label">Nivel</span>
        <input
          type="text"
          placeholder="Ej: Bachillerato"
          :value="nivel"
          @input="$emit('update:nivel', $event.target.value)"
        />
      </label>

      <label class="field">
        <span class="label">Institución</span>
        <input
          type="text"
          placeholder="Ej: Colegio Nacional"
          :value="institucion"
          @input="$emit('update:institucion', $event.target.value)"
        />
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  search: String,
  total: Number,
  estudia: String,
  nivel: String,
  institucion: String,
});
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

.btn-primary {
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.btn-primary:active {
  transform: translateY(1px);
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

.label {
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 1px;
  font-weight: 700;
  color: #64748b;
}

.field input,
.field select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.95rem;
  color: #0f172a;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

@media (max-width: 720px) {
  .title-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>
