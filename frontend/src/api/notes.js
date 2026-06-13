const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, token, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({ error: 'Unexpected response from server' }));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const getNotes    = (token)           => request('/api/notes', token);
export const getNote     = (token, id)       => request(`/api/notes/${id}`, token);
export const createNote  = (token, body)     => request('/api/notes', token, { method: 'POST', body: JSON.stringify(body) });
export const updateNote  = (token, id, body) => request(`/api/notes/${id}`, token, { method: 'PUT',  body: JSON.stringify(body) });
export const deleteNote  = (token, id)       => request(`/api/notes/${id}`, token, { method: 'DELETE' });
