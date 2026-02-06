<template>
  <div class="table-container">
    <table class="recurso-table">
      <thead>
        <tr>
          <th>Ruta Técnica (Endpoint)</th>
          <th>Propósito / Descripción</th>
          <th class="text-center">Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in items" :key="r.endpoint">
          <td class="endpoint-cell">
            <div class="endpoint-badge">
              <span class="method">API</span>
              <code class="path">{{ r.endpoint }}</code>
            </div>
          </td>
          <td class="desc-cell">
            {{ r.descripcion }}
          </td>
          <td class="text-center">
            <span class="status-indicator">Protegido</span>
          </td>
        </tr>
        
        <tr v-if="items.length === 0">
          <td colspan="3" class="empty-msg">No se han detectado recursos registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
/**
 * Prop items: EndpointFlatResponseDto[]
 * Campos: endpoint, descripcion
 */
defineProps(['items']);
</script>

<style scoped>
.table-container { 
  width: 100%; 
  overflow-x: auto; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0;
}

.recurso-table { 
  width: 100%; 
  min-width: 700px; 
  border-collapse: separate; 
  border-spacing: 0; 
  background: white; 
}

.recurso-table th { 
  text-align: left; 
  font-size: 0.7rem; 
  text-transform: uppercase; 
  letter-spacing: 1.2px; 
  color: #64748b; 
  background: #f8fafc; 
  padding: 16px; 
  border-bottom: 1px solid #e2e8f0;
  font-weight: 800;
}

.recurso-table td { 
  padding: 16px; 
  border-bottom: 1px solid #f1f5f9; 
  color: #1e293b; 
  font-size: 0.95rem;
  vertical-align: middle;
}

.endpoint-badge {
  display: inline-flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.method {
  background: #334155;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 8px;
  letter-spacing: 0.5px;
}

.path {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  padding: 0 12px;
  color: #2563eb;
  font-weight: 600;
}

.desc-cell {
  line-height: 1.5;
  color: #475569;
}

.status-indicator {
  font-size: 0.7rem;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.text-center { text-align: center; }

.empty-msg {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}
</style>