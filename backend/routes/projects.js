const router = require('express').Router()
const auth = require('../middlewares/auth')
const rbac = require('../middlewares/rbac')
const { getProjects, createProject, addMember, getProjectTasks } = require('../controllers/projectController')
const { createTask } = require('../controllers/taskController')

router.use(auth)
router.get('/', getProjects)
router.post('/', createProject)
router.post('/:id/members', rbac.requireProjectAdmin, addMember)
router.get('/:id/tasks', rbac.requireProjectMember, getProjectTasks)
router.post('/:id/tasks', rbac.requireProjectAdmin, createTask)

module.exports = router
