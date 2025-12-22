<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Nacionalidades</h2>

      <button class="btn-primary" @click="goToCreate">
        + Nueva Nacionalidad
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
          <tr v-for="item in nacionalidades" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>
              <button class="btn-secondary" @click="edit(item.id)">
                Editar
              </button>
            </td>
          </tr>

          <tr v-if="nacionalidades.length === 0">
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
import { getNacionalidades } from '@/service/nacionalidad.service'

const router = useRouter()
const nacionalidades = ref([])

const load = async () => {
  const res = await getNacionalidades()
  nacionalidades.value = res.data?.data || []
}

const goToCreate = () => {
  router.push('/app/nacionalidad/new')
}

const edit = (id) => {
  router.push(`/app/nacionalidad/${id}`)
}

onMounted(load)
</script>
