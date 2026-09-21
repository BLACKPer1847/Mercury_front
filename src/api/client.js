/*
避免每个页面重复写 fetch 和 token 逻辑的API工具。
*/

// 统一的 API 请求封装
const BASE_URL = '/api'   // 走 Vite 代理，本地开发时转发到远程服务器

// 从 localStorage 读取 token
function getToken() {
  return localStorage.getItem('token')
}

// 通用请求函数
async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    // 把后端返回的 error 字段抛出，方便页面展示
    throw new Error(data.error || `请求失败：${response.status}`)
  }

  return data
}

// 导出具体的 API 方法
export const authApi = {
  register: (username, password) =>
    request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username, password) =>
    request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
}

export const taskApi = {
  getAll: (type) =>
    request(`/tasks${type ? `?type=${type}` : ''}`),

  getOne: (id) => request(`/tasks/${id}`),

  create: (data) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    request(`/tasks/${id}`, { method: 'DELETE' }),
}