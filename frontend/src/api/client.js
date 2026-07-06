const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    let message = 'Something went wrong'
    if (typeof data.detail === 'string') {
      message = data.detail
    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
      message = data.detail[0].msg || message
    }
    throw new ApiError(message, response.status)
  }

  return data
}

export const api = {
  adminLogin: (email, password) =>
    request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  employeeRegister: (email, password) =>
    request('/auth/employee/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  employeeLogin: (email, password) =>
    request('/auth/employee/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  completeProfile: (token, profile) =>
    request('/auth/employee/profile', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(profile),
    }),

  getMe: (token) =>
    request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

export { ApiError }
