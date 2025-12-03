import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import SoldierDashboard from './pages/SoldierDashboard'
import './App.css'

function App() {
  const token = localStorage.getItem('token');
  const userRole = JSON.parse(localStorage.getItem('userRole')); // lưu role khi login

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={token && userRole === 'Admin' ? <AdminDashboard /> : <Navigate to="/" />} 
        />

        {/* Manager Route */}
        <Route 
          path="/manager" 
          element={token && userRole === 'Manager' ? <ManagerDashboard /> : <Navigate to="/" />} 
        />

        {/* Soldier Route */}
        <Route 
          path="/soldier" 
          element={token && userRole === 'Soldier' ? <SoldierDashboard /> : <Navigate to="/" />} 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
