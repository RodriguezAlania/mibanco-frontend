import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BancaInternet from './pages/BancaInternet'
import CoreLogin from './pages/CoreLogin'
import CoreDashboard from './pages/CoreDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/banca" element={<BancaInternet />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/core-login" element={<CoreLogin />} />
      <Route path="/core-dashboard" element={<CoreDashboard />} />
    </Routes>
  )
}

export default App