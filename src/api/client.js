const API_BASE = '/api/v1'

async function request(path, options = {}) {
  const token = localStorage.getItem('kb_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  if (response.status === 401) {
    localStorage.removeItem('kb_token')
    window.location.hash = '#/login'
    throw new Error('未登录')
  }

  if (response.status === 404) {
    throw new Error('资源不存在')
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: '请求失败' }))
    throw new Error(data.message || `请求失败 (${response.status})`)
  }

  return response.json()
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' })
}
