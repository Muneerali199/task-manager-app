const prisma = require('../config/db')

const createTask = async (req, res) => {
  const projId = parseInt(req.params.id)
  const { title, description, assignedTo, dueDate } = req.body
  if (!title) return res.status(400).json({ msg: 'need title' })

  try {
    const task = await prisma.task.create({
      data: {
        projectId: projId,
        title,
        description: description || '',
        assignedTo: assignedTo || null,
        status: 'todo',
        dueDate: dueDate || null
      }
    })
    res.json({ task })
  } catch (err) {
    console.log('createTask err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

const updateTask = async (req, res) => {
  const taskId = parseInt(req.params.id)
  const { status, title, description, dueDate } = req.body
  if (!status && !title && !description && !dueDate) {
    return res.status(400).json({ msg: 'nothing to update' })
  }

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate })
      }
    })
    if (!task) return res.status(404).json({ msg: 'task not found' })
    res.json({ task })
  } catch (err) {
    console.log('updateTask err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

const deleteTask = async (req, res) => {
  const taskId = parseInt(req.params.id)
  try {
    await prisma.task.delete({ where: { id: taskId } })
    res.json({ msg: 'task deleted' })
  } catch (err) {
    console.log('deleteTask err', err.message)
    res.status(500).json({ msg: 'something went wrong' })
  }
}

module.exports = { createTask, updateTask, deleteTask }