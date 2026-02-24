import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Legal', 'Product']

const EMPTY = { employee_id: '', full_name: '', email: '', department: '' }

export function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const toast = useToast()

  const load = () => {
    setLoading(true)
    api.getEmployees()
      .then(setEmployees)
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const validate = () => {
    const e = {}
    if (!form.employee_id.trim()) e.employee_id = 'Required'
    if (!form.full_name.trim()) e.full_name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.department.trim()) e.department = 'Required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await api.createEmployee(form)
      toast('Employee added successfully', 'success')
      setModalOpen(false)
      setForm(EMPTY)
      setErrors({})
      load()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (empId) => {
    try {
      await api.deleteEmployee(empId)
      toast('Employee deleted', 'success')
      setDeleteId(null)
      load()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Employees</h2>
          <p>{employees.length} total employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setErrors({}); setModalOpen(true) }}>
          <PlusIcon /> Add Employee
        </button>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search employees…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <PeopleIcon />
            <h3>{search ? 'No results found' : 'No employees yet'}</h3>
            <p>{search ? 'Try a different search term' : 'Click "Add Employee" to get started'}</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td><code style={{ fontSize: '0.82rem', color: 'var(--accent)', background: 'var(--accent-glow)', padding: '2px 7px', borderRadius: 4 }}>{emp.employee_id}</code></td>
                  <td>{emp.full_name}</td>
                  <td style={{ color: 'var(--text2)' }}>{emp.email}</td>
                  <td><span className="dept-pill">{emp.department}</span></td>
                  <td className="text-muted">{new Date(emp.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteId(emp.employee_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Employee">
        <div className="form-group">
          <label>Employee ID</label>
          <input
            placeholder="e.g. EMP-001"
            value={form.employee_id}
            onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}
          />
          {errors.employee_id && <span className="form-error">{errors.employee_id}</span>}
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input
            placeholder="John Doe"
            value={form.full_name}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
          />
          {errors.full_name && <span className="form-error">{errors.full_name}</span>}
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="john@company.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Department</label>
          <select
            value={form.department}
            onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
          >
            <option value="">Select department…</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <span className="form-error">{errors.department}</span>}
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Add Employee'}
          </button>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Employee">
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: 8 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{deleteId}</strong>?
          This action cannot be undone and will also remove their attendance records.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(deleteId)}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const PeopleIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
