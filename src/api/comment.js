import { api } from './client'

export const commentApi = {
  getComments: (articleId) => api.get(`/articles/${articleId}/comments`),
  createComment: (articleId, data) => api.post(`/articles/${articleId}/comments`, data),
  replyComment: (articleId, parentId, data) => api.post(`/articles/${articleId}/comments/${parentId}/reply`, data),
  updateComment: (articleId, commentId, data) => api.put(`/articles/${articleId}/comments/${commentId}`, data),
  deleteComment: (articleId, commentId) => api.delete(`/articles/${articleId}/comments/${commentId}`),
  likeComment: (articleId, commentId) => api.post(`/articles/${articleId}/comments/${commentId}/like`),
  unlikeComment: (articleId, commentId) => api.delete(`/articles/${articleId}/comments/${commentId}/like`)
}
