import { api } from './client'

export const versionApi = {
  getVersions: (articleId) => api.get(`/articles/${articleId}/versions`),
  getVersion: (articleId, versionId) => api.get(`/articles/${articleId}/versions/${versionId}`),
  compareVersions: (articleId, v1, v2) => api.get(`/articles/${articleId}/versions/compare?from=${v1}&to=${v2}`),
  restoreVersion: (articleId, versionId) => api.post(`/articles/${articleId}/versions/${versionId}/restore`)
}
