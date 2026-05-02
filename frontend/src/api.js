const getToken = () => localStorage.getItem('token')

const apiFetch = async (path, options = {}) => {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  })
  if (res.status === 401) {
    console.log('unauthorized')
    return null
  }
  try {
    return await res.json()
  } catch (err) {
    console.log('json err', err)
    return null
  }
}

export const apiGet = (path) => apiFetch(path, { method: 'GET' })
export const apiPost = (path, data) => apiFetch(path, { method: 'POST', body: JSON.stringify(data) })
export const apiPatch = (path, data) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(data) })
export const apiDelete = (path) => apiFetch(path, { method: 'DELETE' })
