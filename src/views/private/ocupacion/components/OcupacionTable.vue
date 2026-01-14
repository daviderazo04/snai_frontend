<template>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Taller / Actividad</th>
        <th>Instructor</th>
        <th>Fecha</th>
        <th class="text-right">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>#{{ item.id }}</td>
        <td>
          <div class="main-text">{{ item.taller }}</div>
          <div v-if="item.adolescente" class="sub-text">
            {{ item.adolescente.nombre }} {{ item.adolescente.apellido }}
          </div>
        </td>
        <td>{{ item.instructor || '---' }}</td>
        <td>{{ formatDate(item.fecha) }}</td>
        <td class="text-right">          
          <button @click="$emit('edit', item)">Editar</button>
        </td>
      </tr>
      <tr v-if="items.length === 0">
        <td colspan="5" class="empty-cell">No hay ocupaciones registradas.</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { useRouter } from "vue-router"; // 1. Importamos el router

defineProps({ items: Array });

const router = useRouter(); // 2. Inicializamos el router

// 3. Función para navegar al detalle
const goToDetail = (item) => {
  // Navega a la ruta: /ocupacion/123
  router.push(`/ocupacion/${item.id}`);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: white;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.table thead th {
  text-align: left;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #475569;
  background: #f8fafc;
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
}

.table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid #edf2f7;
  color: #0f172a;
  font-size: 0.95rem;
  vertical-align: middle;
}

.table tbody tr:hover td { background: #f8fafc; }
.table tbody tr:last-child td { border-bottom: none; }

.text-right { text-align: right; }

.main-text { font-weight: 600; }
.sub-text { font-size: 0.8rem; color: #64748b; }
.empty-cell { text-align: center; padding: 24px; color: #94a3b8; font-style: italic; }

/* Estilos de botones */
.table button {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #0f172a;
  transition: all 0.15s ease;
  margin-left: 6px;
}

.table button:hover { 
  background: #f1f5f9; 
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); 
}

/* Estilo específico para botón Ver */
.table button.view {
  color: #2563eb;
  background: #eff6ff;
  border-color: #dbeafe;
}

.table button.view:hover {
  background: #dbeafe;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

/* Estilo para botón peligro (si lo usaras en futuro) */
.table button.danger {
  border: none; color: white;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}
</style>