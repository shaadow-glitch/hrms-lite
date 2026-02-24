import { useEffect, useState } from 'react'
import { api } from '../api/client'

export function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><div className="spinner-wrap"><div className="spinner" /></div></div>
  if (error) return <div className="page"><p style={{ color: 'var(--danger)' }}>Error: {error}</p></div>

  const { total_employees, present_today, absent_today, departments, present_days_per_employee } = data
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Dashboard</h2>
          <p>{today}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          value={total_employees}
          label="Total Employees"
          color="#4f8ef7"
          icon={<PeopleIcon />}
        />
        <StatCard
          value={present_today}
          label="Present Today"
          color="#34d399"
          icon={<CheckIcon />}
        />
        <StatCard
          value={absent_today}
          label="Absent Today"
          color="#f87171"
          icon={<XIcon />}
        />
        <StatCard
          value={departments.length}
          label="Departments"
          color="#fbbf24"
          icon={<DeptIcon />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Departments */}
        <div className="card">
          <p className="section-title">Department Breakdown</p>
          {departments.length === 0 ? (
            <p className="text-muted">No employees yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {departments.map(d => (
                <div key={d.department} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="dept-pill">{d.department}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Present days per employee */}
        <div className="card">
          <p className="section-title">Attendance Summary</p>
          {present_days_per_employee.length === 0 ? (
            <p className="text-muted">No attendance records yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {present_days_per_employee.slice(0, 8).map(e => (
                <div key={e.employee_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{e.employee_id}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
                    {e.present_days} day{e.present_days !== 1 ? 's' : ''} present
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, color, icon }) {
  return (
    <div className="stat-card">
      <div className="glow" style={{ background: color }} />
      <div className="icon" style={{ background: color + '20', color }}>
        {icon}
      </div>
      <div className="value" style={{ color }}>{value}</div>
      <div className="label">{label}</div>
    </div>
  )
}

const PeopleIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const XIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const DeptIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
