import { api } from './client'

export const searchApi = {
  search: (keyword, params = {}) => api.post('/search', { keyword, ...params })
}
