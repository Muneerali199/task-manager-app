import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Project from './pages/Project'
import { apiGet } from './api'

function App() {
  const [user, setUser] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) setUser(JSON.parse(userData))
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    nav('/login')
  }

  useEffect(() => {
    if (!user) return
    apiGet('/dashboard').then(data => {
      if (!data) return
      console.log('dashboard loaded', data)
    })
  }, [user])

  return (
    <div className="app-shell">
      <header>
        <Link to="/">Task Manager</Link>
        {user ? (
          <div className="nav-right">
            <span>{user.name}</span>
            <button onClick={logout}>logout</button>
          </div>
        ) : null}
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/projects/:id" element={<Project />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
