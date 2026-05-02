import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiGet, apiPost, apiPatch } from '../api'

export default function Project() {
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [role, setRole] = useState('member')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [due, setDue] = useState('')
  const [msg, setMsg] = useState('')
  const { id } = useParams()
  const nav = useNavigate()

  useEffect(() => {
    apiGet(`/projects/${id}/tasks`).then((res) => {
      if (!res) return
      if (res.tasks) {
        setTasks(res.tasks)
        setMembers(res.members)
        setProject(res.project)
        const userId = Number(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 0)
        const me = res.members.find((m) => m.id === userId)
        if (me) setRole(me.role)
      }
    }).catch(() => nav('/'))
  }, [id])

  const addTask = async (e) => {
    e.preventDefault()
    const assignedId = assignedTo ? Number(assignedTo) : null
    const data = await apiPost(`/projects/${id}/tasks`, {
      title,
      description,
      assigned_to: assignedId,
      due_date: due || null
    })
    if (!data || data.msg) {
      setMsg(data?.msg || 'failed to add task')
      return
    }
    setTasks((prev) => [...prev, data.task])
    setTitle('')
    setDescription('')
    setAssignedTo('')
    setDue('')
    setMsg('task added')
  }

  const updateStatus = async (taskId, nextStatus) => {
    await apiPatch(`/tasks/${taskId}`, { status: nextStatus })
    setTasks((prev) => prev.map((tsk) => (tsk.id === taskId ? { ...tsk, status: nextStatus } : tsk)))
  }

  if (!project) return <div className="page-shell">loading project...</div>

  return (
    <div className="page-shell">
      <h1>{project.name}</h1>
      <div className="project-grid">
        <section className="task-card">
          <h2>Tasks</h2>
          {tasks.length ? (
            <ul>
              {tasks.map((tsk) => (
                <li key={tsk.id} className={tsk.status}>
                  <div>
                    <strong>{tsk.title}</strong>
                    <p>{tsk.description}</p>
                    <small>Assigned: {tsk.assignee_name || 'unassigned'}</small>
                    <small>Status: {tsk.status}</small>
                    <small>Due: {tsk.due_date ? new Date(tsk.due_date).toLocaleDateString() : 'none'}</small>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => updateStatus(tsk.id, 'todo')}>todo</button>
                    <button onClick={() => updateStatus(tsk.id, 'in_progress')}>in progress</button>
                    <button onClick={() => updateStatus(tsk.id, 'done')}>done</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>no tasks yet</p>
          )}
        </section>
        <section className="member-card">
          <h2>Members</h2>
          <ul>
            {members.map((m) => (
              <li key={m.id}>{m.name} ({m.role})</li>
            ))}
          </ul>
          {role === 'admin' ? (
            <form onSubmit={addTask} className="task-form">
              <h3>Add task</h3>
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
              <label>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
              <label>Assign to</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                <option value="">none</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <label>Due date</label>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              {msg ? <p className="hint">{msg}</p> : null}
              <button type="submit">Create task</button>
            </form>
          ) : (
            <p>Only admins can add tasks</p>
          )}
        </section>
      </div>
    </div>
  )
}
