import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Registration from './pages/Registration'
import Cabinets from './pages/Cabinets'
import StudentList from './pages/StudentList'
import Marking from './pages/Marking'
import Leaderboard from './pages/Leaderboard'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/marking" element={<Marking />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/cabinets" element={<Cabinets />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
