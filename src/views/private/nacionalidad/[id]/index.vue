<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ isEdit ? 'Editar Nacionalidad' : 'Nueva Nacionalidad' }}</h2>
    </div>

    <div class="card">
      <form @submit.prevent="save">
        <div class="form-group">
          <label>Nombre</label>
          <input
            v-model="form.nombre"
            type="text"
            class="input"
            required
          />
        </div>

        <div class="actions">
          <button class="btn-primary" type="submit">
            Guardar
          </button>

          <button class="btn-secondary" type="button" @click="back">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createNacionalidad,
  getNacionalidades
} from '@/service/nacionalidad.service'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.params.id !== 'new')

const form = ref({
  nombre: ''
})

const load = async () => {
  if (!isEdit.value) return

  const res = await getNacionalidades()
  const item = res.data.data.find(
    n => n.id == route.params.id
  )

  if (item) {
    form.value.nombre = item.nombre
  }
}

const save = async () => {
  await createNacionalidad(form.value)
  router.push('/app/nacionalidad')
}

const back = () => {
  router.push('/app/nacionalidad')
}

onMounted(load)
</script>
