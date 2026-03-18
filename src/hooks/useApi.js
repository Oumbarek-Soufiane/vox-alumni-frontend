const BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    const error   = new Error(payload.message ?? `Erreur HTTP ${res.status}`)
    error.status  = res.status
    error.errors  = payload.errors ?? null
    throw error
  }
  if (res.status === 204) return null
  return res.json()
}

export const apiGet    = (path)       => apiFetch(path)
export const apiPost   = (path, body) => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) })
export const apiPatch  = (path, body) => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) })
export const apiDelete = (path, body) => apiFetch(path, { method: 'DELETE', body: JSON.stringify(body) })
