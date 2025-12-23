<template>
  <div class="page-container">
    <div class="page-header">
      <h2>G2</h2>

      <button class="btn-primary" @click="goToCreate">
        + Nuevo G2
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
          <tr v-for="item in gdos" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
          </tr>

          <tr v-if="gdos.length === 0">
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
import { getGdos } from '@/service/gdos.service'

const router = useRouter()
const gdos = ref([])

const load = async () => {
  const res = await getGdos()
  gdos.value = res.data?.data || []
}

const goToCreate = () => {
  router.push('/app/gdos/new')
}


onMounted(load)
</script>
