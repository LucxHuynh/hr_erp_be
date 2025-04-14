const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const TaskController = require('../controllers/taskController');

const taskController = new TaskController();

router.post('/', authMiddleware, roleMiddleware(['Admin', 'Manager']), taskController.createTask);
router.put('/:id/assign', authMiddleware, roleMiddleware(['Admin', 'Manager']), taskController.assignTask);
router.put('/:id/status', authMiddleware, roleMiddleware(['Admin', 'Manager', 'Employee']), taskController.updateTaskStatus);
router.put('/:id/priority', authMiddleware, roleMiddleware(['Admin', 'Manager']), taskController.updateTaskPriority);
router.get('/', authMiddleware, taskController.getTasks);
router.get('/:id', authMiddleware, taskController.getTaskById);
router.get('/project/:project_id', authMiddleware, taskController.getTasksByProject);
router.get('/user/:user_id', authMiddleware, taskController.getTasksByUser);
router.put('/:id/delete', authMiddleware, roleMiddleware(['Admin', 'Manager']), taskController.deleteTask);

module.exports = router;
