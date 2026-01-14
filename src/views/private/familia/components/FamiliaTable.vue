<template>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Adolescente</th>
        <th>Fecha Interacción</th>
        <th>Detalle (Resumen)</th>
        <th class="text-right">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>#{{ item.id }}</td>
        <td>
          <div class="main-text">
            {{ item.adolescente ? item.adolescente.nombre : '---' }}
            {{ item.adolescente ? item.adolescente.apellido : '' }}
          </div>
          <div class="sub-text" v-if="item.adolescente">
            CI: {{ item.adolescente.cedula }}
          </div>
        </td>
        <td>{{ formatDate(item.fecha) }}</td>
        <td>
          <span class="truncate-text" :title="item.detalle">
            {{ item.detalle }}
          </span>
        </td>
        <td class="text-right">
          <button @click="$emit('edit', item)">Editar</button>
          <button class="danger" @click="$emit('remove', item)">Eliminar</button>
        </td>
      </tr>
      <tr v-if="items.length === 0">
        <td colspan="5" class="empty-cell">No hay registros de familia.</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { useRouter } from "vue-router";

defineProps({ items: Array });

const router = useRouter();

const goToDetail = (item) => {
  router.push(`/familia/${item.id}`);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>

<style scoped>
.table {
  width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden;
  border-radius: 16px; border: 1px solid #e2e8f0; background: white;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06); table-layout: fixed;
}

.table thead th {
  text-align: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px;
  color: #475569; background: #f8fafc; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;
}

.table tbody td {
  padding: 12px 14px; border-bottom: 1px solid #edf2f7; color: #0f172a;
  font-size: 0.95rem; vertical-align: middle;
}

.table tbody tr:hover td { background: #f8fafc; }
.table tbody tr:last-child td { border-bottom: none; }

.text-right { text-align: right; }
.main-text { font-weight: 600; }
.sub-text { font-size: 0.8rem; color: #64748b; }
.empty-cell { text-align: center; padding: 24px; color: #94a3b8; font-style: italic; }

.truncate-text {
  display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;
}

/* Botones */
.table button {
  border: 1px solid #e2e8f0; background: white; padding: 8px 12px; border-radius: 10px;
  cursor: pointer; font-weight: 600; color: #0f172a; transition: all 0.15s ease; margin-left: 6px;
}
.table button:hover { background: #f1f5f9; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }

/* Botón Ver */
.table button.view { color: #2563eb; background: #eff6ff; border-color: #dbeafe; }
.table button.view:hover { background: #dbeafe; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1); }

/* Botón Eliminar */
.table button.danger { border: none; color: white; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
</style>