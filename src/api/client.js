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

// auth检查和登出工具
export const auth = {
  isLoggedIn: () => !!localStorage.getItem('token'),
  // 只用来决定「要不要显示管理入口」，真正的权限由后端每个管理接口校验
  isAdmin: () => localStorage.getItem('is_admin') === 'true',
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('is_admin')
  },
  getUsername: () => localStorage.getItem('username'),
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

  me: () => request('/me'),
}

export const taskApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },

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

// 用户在「添加待办 → 从模板选择」里浏览/接取活动
export const templateApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/templates${query ? `?${query}` : ''}`);
  },

  getOne: (id) => request(`/templates/${id}`),

  claim: (id) => request(`/templates/${id}/claim`, { method: 'POST' }),
}

// 管理端接口（后端会校验 is_admin，前端隐藏入口只是体验优化）
export const adminApi = {
  listTemplates: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/templates${query ? `?${query}` : ''}`);
  },

  createTemplate: (data) =>
    request('/admin/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTemplate: (id, data) =>
    request(`/admin/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateTemplateStatus: (id, status) =>
    request(`/admin/templates/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  batchPublish: (ids) =>
    request('/admin/templates/batch-publish', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  listCrawlSources: () => request('/admin/crawl-sources'),

  createCrawlSource: (data) =>
    request('/admin/crawl-sources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCrawlSource: (id, data) =>
    request(`/admin/crawl-sources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCrawlSources: (ids) =>
    request('/admin/crawl-sources', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
}