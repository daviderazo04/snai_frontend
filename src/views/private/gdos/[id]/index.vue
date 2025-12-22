<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Nuevo G2</h2>
    </div>

    <div class="card">
      <form @submit.prevent="save">
        <div class="form-group">
          <label>Nombre</label>
          <input
            v-model="nombre"
            type="text"
            class="input"
            required
          />
        </div>

        <div class="actions">
          <button class="btn-primary" type="submit">
            Guardar
          </button>

          <button
            class="btn-secondary"
            type="button"
            @click="back"
          >
            Cancelar
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

const save = async () => {
  try {
    console.log('ANTES DEL POST')

    const res = await createGdo({ nombre: nombre.value })

    console.log('RESPUESTA DEL BACKEND:', res)

    alert('GUARDADO OK')
    router.push('/app/gdos')
  } catch (error) {
    console.error('ERROR AL GUARDAR G2:', error)
    alert('ERROR AL GUARDAR, REVISA CONSOLA')
  }
}


const back = () => {
  router.push('/app/gdos')
}
</script>
