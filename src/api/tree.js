import { api } from './client'

export const treeApi = {
  getTree: () => api.get('/tree'),
  createNode: (data) => api.post('/tree/nodes', data),
  updateNode: (id, data) => api.put(`/tree/nodes/${id}`, data),
  deleteNode: (id) => api.delete(`/tree/nodes/${id}`),
  moveNode: (id, data) => api.post(`/tree/nodes/${id}/move`, data),
  getNodePermissions: (id) => api.get(`/tree/nodes/${id}/permissions`)
}
