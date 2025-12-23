import { api } from '@/service/apiClient'

export function getGdos() {
  return api.get('/gdos')
}

export function createGdo(payload) {
  return api.post('/gdos', payload)
}
