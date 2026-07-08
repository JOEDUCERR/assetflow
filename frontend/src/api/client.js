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

function withToken(token, options = {}) {
  return {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  }
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
    request(
      '/auth/employee/profile',
      withToken(token, {
        method: 'POST',
        body: JSON.stringify(profile),
      }),
    ),

  getMe: (token) => request('/auth/me', withToken(token)),

  listAssets: (token, assignedOnly = false) =>
    request(
      `/assets?assigned_only=${assignedOnly}`,
      withToken(token),
    ),

  createAsset: (token, asset) =>
    request(
      '/assets',
      withToken(token, {
        method: 'POST',
        body: JSON.stringify(asset),
      }),
    ),

  getAssetHistory: (token, assetId) =>
    request(`/assets/${assetId}/history`, withToken(token)),

  getAssetQr: (token, assetId) =>
    request(`/assets/${assetId}/qr`, withToken(token)),

  manualAssignAsset: (token, assetId, empId) =>
    request(
      `/assets/${assetId}/assign`,
      withToken(token, {
        method: 'POST',
        body: JSON.stringify({ emp_id: empId }),
      }),
    ),

  manualReturnAsset: (token, assetId) =>
    request(
      `/assets/${assetId}/return`,
      withToken(token, { method: 'POST' }),
    ),

  previewAssetByScan: (token, qrToken) =>
    request(
      '/assets/scan/preview',
      withToken(token, {
        method: 'POST',
        body: JSON.stringify({ qr_token: qrToken }),
      }),
    ),

  takeAssetByScan: (token, qrToken) =>
    request(
      '/assets/scan/take',
      withToken(token, {
        method: 'POST',
        body: JSON.stringify({ qr_token: qrToken }),
      }),
    ),

  returnAssetByScan: (token, qrToken) =>
    request(
      '/assets/scan/return',
      withToken(token, {
        method: 'POST',
        body: JSON.stringify({ qr_token: qrToken }),
      }),
    ),
}

export { ApiError }
