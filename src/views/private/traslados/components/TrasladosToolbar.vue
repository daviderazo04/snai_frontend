<!-- src/views/private/traslados/components/TrasladosToolbar.vue -->
<template>
  <div class="toolbar">
    <div class="title-block">
      <div>
        <h2>Listado de Traslados</h2>
        <p class="subtitle">{{ total }} registros disponibles</p>
      </div>
      <button class="btn-primary" type="button" @click="$emit('create')">
        + Nuevo traslado
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
        <span class="label">Orden por fecha</span>
        <select :value="dateSort" @change="$emit('update:dateSort', $event.target.value)">
          <option value="desc">Más recientes</option>
          <option value="asc">Más antiguos</option>
        </select>
      </label>

      <label class="field">
        <span class="label">Desde</span>
        <input type="date" :value="dateFrom" @input="$emit('update:dateFrom', $event.target.value)" />
      </label>

      <label class="field">
        <span class="label">Hasta</span>
        <input type="date" :value="dateTo" @input="$emit('update:dateTo', $event.target.value)" />
      </label>

      <label class="field">
        <span class="label">Provincia</span>
        <select :value="provinceId" @change="$emit('update:province', $event.target.value)">
          <option value="">Todas</option>
          <option v-for="provincia in provincias" :key="provincia.id" :value="provincia.id">
            {{ provincia.nombre }}
          </option>
        </select>
      </label>

      <label class="field">
        <span class="label">Cantón</span>
        <select :value="cantonId" @change="$emit('update:canton', $event.target.value)">
          <option value="">Todos</option>
          <option v-for="canton in cantones" :key="canton.id" :value="canton.id">
            {{ canton.nombre }}
          </option>
        </select>
      </label>

      <label class="field">
        <span class="label">CAI</span>
        <select :value="caiId" @change="$emit('update:cai', $event.target.value)">
          <option value="">Todos</option>
          <option v-for="cai in cais" :key="cai.id" :value="cai.id">
            {{ cai.nombre }} — {{ cai.cantonNombre || "Sin cantón" }} / {{ cai.provinciaNombre || "Sin provincia" }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  search: String,
  total: Number,
  dateFrom: String,
  dateTo: String,
  dateSort: String,
  provinceId: [String, Number],
  cantonId: [String, Number],
  caiId: [String, Number],
  provincias: {
    type: Array,
    default: () => [],
  },
  cantones: {
    type: Array,
    default: () => [],
  },
  cais: {
    type: Array,
    default: () => [],
  },
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
