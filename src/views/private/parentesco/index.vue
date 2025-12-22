<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Parentesco</h2>

      <button class="btn-primary" @click="goToCreate">
        + Nuevo Parentesco
      </button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th style="width: 140px">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in parentescos" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>
              <button class="btn-secondary" @click="edit(item.id)">
                Editar
              </button>
            </td>
          </tr>

          <tr v-if="parentescos.length === 0">
            <td colspan="3">No hay registros</td>
          </tr>
        </tbody>
      </table>
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
  const res = await getParentescos()
  parentescos.value = res.data?.data || []
}

const goToCreate = () => {
  router.push('/app/parentesco/new')
}

const edit = (id) => {
  router.push(`/app/parentesco/${id}`)
}

onMounted(load)
</script>
