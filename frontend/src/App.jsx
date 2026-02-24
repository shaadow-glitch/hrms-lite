import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import { Dashboard } from './pages/Dashboard'
import { Employees } from './pages/Employees'
import { Attendance } from './pages/Attendance'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/attendance" element={<Attendance />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ToastProvider>
  )
}
