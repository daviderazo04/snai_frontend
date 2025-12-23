<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ isEdit ? 'Editar Parentesco' : 'Nuevo Parentesco' }}</h2>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getParentescos, createParentesco } from '@/service/parentesco.service'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  nombre: ''
})

const load = async () => {
  if (!isEdit.value) return

  const res = await getParentescos()
  const item = res.data.data.find(p => p.id == route.params.id)

  if (item) {
    form.value.nombre = item.nombre
  }
}

const save = async () => {
  await createParentesco(form.value)
  router.push('/app/parentesco')
}

const back = () => {
  router.push('/app/parentesco')
}

onMounted(load)
</script>
