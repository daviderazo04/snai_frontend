<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ isEdit ? 'Editar Etnia' : 'Nueva Etnia' }}</h2>
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
  createEtnia,
  getEtnias
} from '@/service/etnia.service'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.params.id !== 'new')

const form = ref({
  nombre: ''
})

const load = async () => {
  if (!isEdit.value) return

  const res = await getEtnias()
  const etnia = res.data.data.find(e => e.id == route.params.id)
  if (etnia) form.value = { nombre: etnia.nombre }
}

const save = async () => {
  await createEtnia(form.value)
  router.push('/app/etnia')
}

const back = () => {
  router.push('/app/etnia')
}

onMounted(load)
</script>
