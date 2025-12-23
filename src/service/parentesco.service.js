import { api } from '@/service/apiClient'

export function getParentescos() {
  return api.get('/parentesco')
}

export function createParentesco(payload) {
  return api.post('/parentesco', payload)
}
