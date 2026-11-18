const TOKEN_KEY = 'toyamas_admin_token';

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuthToken(token) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || `Permintaan gagal (${response.status}).`);
    err.status = response.status;
    throw err;
  }
  return data;
}

export const api = {
  getMe: () => request('/api/auth/me'),
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  getDashboard: () => request('/api/dashboard'),
  getComplaints: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'Semua') query.set('status', params.status);
    if (params.category && params.category !== 'Semua') query.set('category', params.category);
    if (params.q) query.set('q', params.q);
    const qs = query.toString();
    return request(`/api/complaints${qs ? `?${qs}` : ''}`);
  },
  getComplaint: (id) => request(`/api/complaints/${id}`),
  createComplaint: (payload) =>
    request('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateComplaintStatus: (id, payload) =>
    request(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  analyzeComplaint: (id) =>
    request(`/api/complaints/${id}/analyze`, {
      method: 'POST'
    }),
  deleteComplaint: (id) =>
    request(`/api/complaints/${id}`, {
      method: 'DELETE'
    }),
  getAiStatus: () => request('/api/ai/status'),
  analyzePreview: (payload) =>
    request('/api/ai/analyze-preview', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  askAssistant: (question) =>
    request('/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ question })
    }),
  getVillageInfo: () => request('/api/village'),
  createAnnouncement: (payload) =>
    request('/api/village/announcements', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
