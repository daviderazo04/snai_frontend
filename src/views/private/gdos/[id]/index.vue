<template>
  <div class="page-container">
    <div class="page-header">
      <button class="btn-back" @click="back" title="Volver a lista">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="title-wrap">
        <h2>Nuevo G2</h2>
        <span class="subtitle">Crear un nuevo registro GDO</span>
      </div>
    </div>

    <div class="form-card">
      <form @submit.prevent="save">
        <div class="card-body">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input
              id="nombre"
              v-model="nombre"
              type="text"
              class="input-field"
              placeholder="Ingrese el nombre del G2"
              required
              :disabled="loading"
              autofocus
            />
          </div>
        </div>

        <div class="card-footer">
          <button 
            class="btn-secondary" 
            type="button" 
            @click="back"
            :disabled="loading"
          >
            Cancelar
          </button>
          
          <button 
            class="btn-primary" 
            type="submit"
            :disabled="loading"
            :class="{ 'is-loading': loading }"
          >
            <svg v-if="loading" class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            <span>{{ loading ? 'Guardando...' : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createGdo } from '@/service/gdos.service'

const router = useRouter()
const nombre = ref('')
const loading = ref(false)

const save = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    console.log('ANTES DEL POST')
    
    // Llamada al servicio
    const res = await createGdo({ nombre: nombre.value })
    
    console.log('RESPUESTA DEL BACKEND:', res)
    
    // Mantenemos tu alert original para confirmación
    alert('GUARDADO OK')
    router.push('/app/gdos')
    
  } catch (error) {
    console.error('ERROR AL GUARDAR G2:', error)
    alert('ERROR AL GUARDAR, REVISA CONSOLA')
  } finally {
    loading.value = false
  }
}

const back = () => {
  router.push('/app/gdos')
}
</script>

<style scoped>
/* Layout Base */
.page-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
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

/* Botón Back Circular */
.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-body {
  padding: 24px;
}

.card-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Inputs */
.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 6px;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.95rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #0f172a;
  background: #fff;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-field:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

/* Botones de Acción */
button {
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #93c5fd;
  cursor: wait;
}

.btn-secondary {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

/* Spinner Animation */
.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>