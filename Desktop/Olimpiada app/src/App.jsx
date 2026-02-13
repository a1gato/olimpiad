import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import SplashScreen from './components/SplashScreen'
import Dashboard from './pages/Dashboard'
import Registration from './pages/Registration'
import Cabinets from './pages/Cabinets'
import StudentList from './pages/StudentList'
import Marking from './pages/Marking'
import Leaderboard from './pages/Leaderboard'
import './index.css'

function App() {
  const [splashFinished, setSplashFinished] = useState(false)

  return (
    <AuthProvider>
      {!splashFinished ? (
        <SplashScreen onFinish={() => setSplashFinished(true)} />
      ) : (
        <BrowserRouter>
          <Routes>
            {/* Public Routes wrapped in Layout */}
            <Route path="/" element={<Layout><Dashboard /></Layout>} />

            <Route path="/register" element={<Layout><Registration /></Layout>} />

            <Route path="/students" element={<Layout><StudentList /></Layout>} />
            <Route path="/marking" element={<Layout><Marking /></Layout>} />
            <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
            <Route path="/cabinets" element={<Layout><Cabinets /></Layout>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </AuthProvider>
  )
}

export default App
