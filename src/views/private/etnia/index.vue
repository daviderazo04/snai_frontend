<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Etnías</h2>

      <button class="btn-primary" @click="goToCreate">
        + Nueva Etnia
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
          <tr v-for="etnia in etnias" :key="etnia.id">
            <td>{{ etnia.id }}</td>
            <td>{{ etnia.nombre }}</td>
            <td>
              <button class="btn-secondary" @click="edit(etnia.id)">
                Editar
              </button>
            </td>
          </tr>

          <tr v-if="etnias.length === 0">
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
import { getEtnias } from '@/service/etnia.service'

const router = useRouter()
const etnias = ref([])

const load = async () => {
  const res = await getEtnias()
  etnias.value = res.data?.data || []
}

const goToCreate = () => {
  router.push('/app/etnia/new')
}

const edit = (id) => {
  router.push(`/app/etnia/${id}`)
}

onMounted(load)
</script>
