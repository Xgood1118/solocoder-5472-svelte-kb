import { api } from './client'

export const articleApi = {
  getArticle: (id) => api.get(`/articles/${id}`),
  createArticle: (data) => api.post('/articles', data),
  updateArticle: (id, data) => api.put(`/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/articles/${id}`),
  getArticleLock: (id) => api.get(`/articles/${id}/lock`),
  acquireLock: (id) => api.post(`/articles/${id}/lock`),
  releaseLock: (id) => api.delete(`/articles/${id}/lock`),
  renewLock: (id) => api.post(`/articles/${id}/lock/renew`),
  likeArticle: (id) => api.post(`/articles/${id}/like`),
  unlikeArticle: (id) => api.delete(`/articles/${id}/like`)
}
