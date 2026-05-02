const prisma = require('../config/db')

const requireProjectAdmin = async (req, res, next) => {
  const projId = parseInt(req.params.id)
  if (!projId) return res.status(400).json({ msg: 'need project id' })

  try {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: projId, userId: req.user.id } }
    })
    if (!member) return res.status(403).json({ msg: 'not a project member' })
    if (member.role !== 'admin') return res.status(403).json({ msg: 'need admin' })
    next()
  } catch (err) {
    console.log('requireProjectAdmin err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

const requireProjectMember = async (req, res, next) => {
  const projId = parseInt(req.params.id)
  try {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: projId, userId: req.user.id } }
    })
    if (!member) return res.status(403).json({ msg: 'not a member' })
    next()
  } catch (err) {
    console.log('requireProjectMember err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

const requireTaskOwnerOrAdmin = async (req, res, next) => {
  const taskId = parseInt(req.params.id)
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) return res.status(404).json({ msg: 'task not found' })

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } }
    })
    if (!member) return res.status(403).json({ msg: 'not a member' })
    if (member.role === 'admin' || task.assignedTo === req.user.id) {
      next()
    } else {
      res.status(403).json({ msg: 'not allowed' })
    }
  } catch (err) {
    console.log('requireTaskOwnerOrAdmin err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

const requireTaskAdmin = async (req, res, next) => {
  const taskId = parseInt(req.params.id)
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) return res.status(404).json({ msg: 'task not found' })

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } }
    })
    if (!member || member.role !== 'admin') return res.status(403).json({ msg: 'need admin' })
    next()
  } catch (err) {
    console.log('requireTaskAdmin err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

module.exports = { requireProjectAdmin, requireProjectMember, requireTaskOwnerOrAdmin, requireTaskAdmin }