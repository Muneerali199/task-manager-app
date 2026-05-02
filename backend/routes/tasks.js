const router = require('express').Router()
const auth = require('../middlewares/auth')
const rbac = require('../middlewares/rbac')
const { updateTask, deleteTask } = require('../controllers/taskController')

router.use(auth)
router.patch('/:id', rbac.requireTaskOwnerOrAdmin, updateTask)
router.delete('/:id', rbac.requireTaskAdmin, deleteTask)

module.exports = router
