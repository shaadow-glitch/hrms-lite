const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.detail || data?.message || 'Something went wrong'
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return data
}

export const api = {
  // Employees
  getEmployees: () => request('/employees'),
  createEmployee: (body) => request('/employees', { method: 'POST', body }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: (params = {}) => {
    const q = new URLSearchParams()
    if (params.employee_id) q.set('employee_id', params.employee_id)
    if (params.date_from) q.set('date_from', params.date_from)
    if (params.date_to) q.set('date_to', params.date_to)
    return request(`/attendance?${q}`)
  },
  markAttendance: (body) => request('/attendance', { method: 'POST', body }),
  deleteAttendance: (id) => request(`/attendance/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: () => request('/dashboard'),
}
