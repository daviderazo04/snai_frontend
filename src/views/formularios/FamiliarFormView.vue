<template>
  <div class="form-container">
    <h1>Formulario Jurídica</h1>

    <div class="field-group">
      <label for="evento-select">Seleccionar Evento:</label>
      
      <select 
        id="evento-select" 
        v-model="form.eventoId" 
        class="styled-select"
        :disabled="loading"
      >
        <option :value="null" disabled>
          {{ loading ? 'Cargando eventos...' : 'Seleccione un evento' }}
        </option>
        <option 
          v-for="evento in eventosList" 
          :key="evento.id" 
          :value="evento.id"
        >
          {{ evento.nombre }}
        </option>
      </select>
      
      <p class="helper-text" v-if="form.eventoId">
        ID Seleccionado: {{ form.eventoId }}
      </p>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, reactive } from "vue";
// Asegúrate de que la ruta al servicio sea la correcta según tu estructura
import { getEventos } from "../../service/evento.service"; 

export default {
  name: "JuridicaFormView",
  setup() {
    // Estado del formulario
    const form = reactive({
      eventoId: null,
      // otros campos...
    });

    // Estado para la lista de eventos
    const eventosList = ref([]);
    const loading = ref(false);

    // Función para cargar los eventos desde la API
    const cargarEventos = async () => {
      loading.value = true;
      try {
        // Solicitamos un tamaño grande para traer todos en el selector
        const res = await getEventos({ size: 100 });
        
        // Manejo robusto de la respuesta (por si viene paginado o directo)
        const payload = res.data || res;
        if (Array.isArray(payload)) {
          eventosList.value = payload;
        } else if (payload.data && Array.isArray(payload.data)) {
          eventosList.value = payload.data;
        } else if (payload.items && Array.isArray(payload.items)) {
          eventosList.value = payload.items;
        }
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        loading.value = false;
      }
    };

    // Cargar al montar el componente
    onMounted(() => {
      cargarEventos();
    });

    return {
      form,
      eventosList,
      loading
    };
  },
};
</script>

<style scoped>
.form-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

label {
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
}

.styled-select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #fff;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  /* Flecha personalizada */
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.styled-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.styled-select:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.helper-text {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}
</style>