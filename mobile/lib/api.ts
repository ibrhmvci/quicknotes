const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) {
  throw new Error(
    '[api] EXPO_PUBLIC_API_URL is not set. Add it to your .env file (local) or run:\n' +
    '  eas env:create --name EXPO_PUBLIC_API_URL --value "https://your-backend.railway.app" --environment production'
  );
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(
  path: string,
  options: RequestInit & { token: string }
): Promise<T> {
  const { token, ...init } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body || res.statusText), { status: res.status });
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

export const api = {
  notes: {
    list: (token: string) =>
      request<Note[]>('/api/notes', { method: 'GET', token }),

    create: (token: string, body: { title: string; content: string }) =>
      request<Note>('/api/notes', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      }),

    update: (
      token: string,
      id: string,
      body: { title?: string; content?: string }
    ) =>
      request<Note>(`/api/notes/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(body),
      }),

    delete: (token: string, id: string) =>
      request<void>(`/api/notes/${id}`, { method: 'DELETE', token }),
  },
};
