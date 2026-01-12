<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title-wrap">
        <h2>Parentescos</h2>
        <span class="subtitle">Gestión de relaciones familiares</span>
      </div>

      <button class="btn-primary" @click="goToCreate">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Nuevo Parentesco
      </button>
    </div>

    <div class="table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="w-1">ID</th>
              <th>Nombre</th>
              <th class="w-1 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in parentescos" :key="item.id">
              <td class="id-cell">#{{ item.id }}</td>
              <td>
                <span class="name">{{ item.nombre }}</span>
              </td>
              <td class="text-right">
                <button 
                  class="btn-icon" 
                  title="Editar" 
                  @click="edit(item.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
              </td>
            </tr>

            <tr v-if="parentescos.length === 0">
              <td colspan="3">
                <div class="empty">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  <strong>Sin registros</strong>
                  <span>No hay parentescos registrados.</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getParentescos } from '@/service/parentesco.service'

const router = useRouter()
const parentescos = ref([])

const load = async () => {
  try {
    const res = await getParentescos()
    parentescos.value = res.data?.data || []
  } catch (error) {
    console.error("Error cargando parentescos:", error)
  }
}

const goToCreate = () => {
  router.push('/app/parentesco/new')
}

const edit = (id) => {
  router.push(`/app/parentesco/${id}`)
}

onMounted(load)
</script>

<style scoped>
/* Layout Principal */
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.title-wrap h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.875rem;
}

/* Botón Primario */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #2563eb;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

tbody tr:hover {
  background-color: #f8fafc;
}

tbody tr:last-child td {
  border-bottom: none;
}

/* Utilidades de celda */
.w-1 { width: 1%; white-space: nowrap; }
.text-right { text-align: right; }

.id-cell {
  font-family: monospace;
  color: #64748b;
}

.name {
  font-weight: 500;
  color: #0f172a;
}

/* Botón de Icono */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
  color: #2563eb;
}

/* Estado Vacío */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: #94a3b8;
}

.empty strong {
  color: #475569;
  font-weight: 600;
}
</style>