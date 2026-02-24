import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'

const today = () => new Date().toISOString().split('T')[0]

export function Attendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ employee_id: '', date: today(), status: 'Present' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [filterEmp, setFilterEmp] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const toast = useToast()

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      api.getAttendance({ employee_id: filterEmp, date_from: filterFrom, date_to: filterTo }),
      api.getEmployees(),
    ])
      .then(([recs, emps]) => { setRecords(recs); setEmployees(emps) })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [filterEmp, filterFrom, filterTo])

  const validate = () => {
    const e = {}
    if (!form.employee_id) e.employee_id = 'Required'
    if (!form.date) e.date = 'Required'
    if (!form.status) e.status = 'Required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await api.markAttendance(form)
      toast('Attendance marked successfully', 'success')
      setModalOpen(false)
      loadAll()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteAttendance(id)
      toast('Record deleted', 'success')
      loadAll()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const empMap = Object.fromEntries(employees.map(e => [e.employee_id, e.full_name]))

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Attendance</h2>
          <p>{records.length} record{records.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ employee_id: '', date: today(), status: 'Present' }); setErrors({}); setModalOpen(true) }}>
          <PlusIcon /> Mark Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="toolbar">
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} style={{ minWidth: 180 }}>
          <option value="">All employees</option>
          {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>)}
        </select>
        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} title="From date" />
        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} title="To date" />
        {(filterEmp || filterFrom || filterTo) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilterEmp(''); setFilterFrom(''); setFilterTo('') }}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : records.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <CalendarIcon />
            <h3>No attendance records</h3>
            <p>Mark attendance using the button above</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td><code style={{ fontSize: '0.82rem', color: 'var(--accent)', background: 'var(--accent-glow)', padding: '2px 7px', borderRadius: 4 }}>{r.employee_id}</code></td>
                  <td>{empMap[r.employee_id] || '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>
                    {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>
                      {r.status === 'Present' ? <CheckIcon /> : <XIcon />}
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mark Attendance Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Mark Attendance">
        <div className="form-group">
          <label>Employee</label>
          {employees.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>No employees found. Add employees first.</p>
          ) : (
            <select
              value={form.employee_id}
              onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}
            >
              <option value="">Select employee…</option>
              {employees.map(e => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.full_name} ({e.employee_id})
                </option>
              ))}
            </select>
          )}
          {errors.employee_id && <span className="form-error">{errors.employee_id}</span>}
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
          />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            value={form.status}
            onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          {errors.status && <span className="form-error">{errors.status}</span>}
        </div>
        <p className="text-muted" style={{ marginTop: -8, marginBottom: 4 }}>
          If a record exists for this employee on that date, it will be updated.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || employees.length === 0}>
            {saving ? 'Saving…' : 'Mark Attendance'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const CalendarIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const CheckIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const XIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
