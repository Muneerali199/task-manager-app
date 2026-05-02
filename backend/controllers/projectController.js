const prisma = require('../config/db')

const getProjects = async (req, res) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      include: { project: true },
      orderBy: { project: { createdAt: 'desc' } }
    })
    const projects = members.map(m => ({ ...m.project, role: m.role }))
    res.json({ projects })
  } catch (err) {
    console.log('getProjects err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

const createProject = async (req, res) => {
  const { name, description } = req.body
  if (!name) return res.status(400).json({ msg: 'need a name' })

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description: description || '',
        createdBy: req.user.id,
        members: {
          create: { userId: req.user.id, role: 'admin' }
        }
      }
    })
    res.json({ project })
  } catch (err) {
    console.log('createProject err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

const addMember = async (req, res) => {
  const projId = parseInt(req.params.id)
  const { email, role } = req.body
  if (!email) return res.status(400).json({ msg: 'need email' })
  const finalRole = role === 'admin' ? 'admin' : 'member'

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ msg: 'user missing' })

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: projId, userId: user.id } }
    })
    if (existing) return res.status(400).json({ msg: 'already a member' })

    await prisma.projectMember.create({
      data: { projectId: projId, userId: user.id, role: finalRole }
    })
    res.json({ msg: 'member added', member: { id: user.id, name: user.name, email: user.email, role: finalRole } })
  } catch (err) {
    console.log('addMember err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

const getProjectTasks = async (req, res) => {
  const projId = parseInt(req.params.id)
  try {
    const project = await prisma.project.findUnique({ where: { id: projId } })
    if (!project) return res.status(404).json({ msg: 'project not found' })

    const tasks = await prisma.task.findMany({
      where: { projectId: projId },
      include: { assignee: { select: { name: true } } },
      orderBy: { dueDate: 'asc' }
    })

    const members = await prisma.projectMember.findMany({
      where: { projectId: projId },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    res.json({ project, tasks, members })
  } catch (err) {
    console.log('getProjectTasks err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

const dashboard = async (req, res) => {
  try {
    const myProjectIds = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true }
    })
    const projIds = myProjectIds.map(p => p.projectId)

    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projIds },
        status: { not: 'done' },
        dueDate: { lt: new Date() }
      }
    })
    const overdue = tasks.length

    const projects = await prisma.project.findMany({
      where: { id: { in: projIds } },
      include: {
        tasks: true
      }
    })

    const projectsWithCounts = projects.map(p => ({
      id: p.id,
      name: p.name,
      total_count: p.tasks.length,
      done_count: p.tasks.filter(t => t.status === 'done').length
    }))

    res.json({ overdue, projects: projectsWithCounts })
  } catch (err) {
    console.log('dashboard err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

module.exports = { getProjects, createProject, addMember, getProjectTasks, dashboard }