import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import SplashScreen from './components/SplashScreen'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Registration from './pages/Registration'
import Cabinets from './pages/Cabinets'
import StudentList from './pages/StudentList'
import Marking from './pages/Marking'
import Leaderboard from './pages/Leaderboard'
import Login from './pages/Login'
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
            <Route path="/login" element={<Login />} />

            {/* Protected Routes wrapped in Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <ProtectedRoute>
                <Layout><Registration /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute>
                <Layout><StudentList /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/marking" element={
              <ProtectedRoute>
                <Layout><Marking /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Layout><Leaderboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/cabinets" element={
              <ProtectedRoute>
                <Layout><Cabinets /></Layout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </AuthProvider>
  )
}

export default App
