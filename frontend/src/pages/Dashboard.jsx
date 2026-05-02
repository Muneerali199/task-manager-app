import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../api'

export default function Dashboard({ user }) {
  const [data, setData] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  const load = () => {
    apiGet('/dashboard').then((res) => {
      if (res?.projects) setData(res)
    })
  }

  useEffect(() => {
    if (!user) {
      nav('/login')
      return
    }
    load()
  }, [user])

  const createProject = async (e) => {
    e.preventDefault()
    const res = await apiPost('/projects', { name, description })
    if (!res || res.msg) {
      setError(res?.msg || 'could not create')
      return
    }
    setError('')
    setName('')
    setDescription('')
    load()
  }

  if (!user) return <div className="page-shell">redirecting...</div>
  if (!data) return <div className="page-shell">loading...</div>

  return (
    <div className="page-shell">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="card">
          <h3>Overdue tasks</h3>
          <p>{data.overdue}</p>
        </div>
        <div className="card project-list">
          <h3>Your projects</h3>
          {data.projects.length ? (
            <ul>
              {data.projects.map((proj) => (
                <li key={proj.id}>
                  <Link to={`/projects/${proj.id}`}>{proj.name}</Link>
                  <span>{proj.done_count}/{proj.total_count} done</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>no projects yet</p>
          )}
        </div>
      </div>
      <div className="card">
        <h3>Create project</h3>
        <form onSubmit={createProject} className="task-form">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
          {error ? <p className="error">{error}</p> : null}
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  )
}
