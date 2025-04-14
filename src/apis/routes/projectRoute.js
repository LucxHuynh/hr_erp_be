const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const projectController = new ProjectController();

router.post('/', authMiddleware, roleMiddleware(['Admin', 'Manager']), projectController.createProject);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Manager']), projectController.updateProject);
router.put('/:id/delete', authMiddleware, roleMiddleware(['Admin', 'Manager']), projectController.deleteProject);
router.get('/', authMiddleware, roleMiddleware('Admin'), projectController.getProjects);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin", "Manager", "Employee", "Account"]),
  projectController.getProjectById
);
router.post("/name", authMiddleware, projectController.getProjectByName);
router.get(
  "/manager/:managerId",
  authMiddleware,
  projectController.getProjectByManager
);
router.get("/user/:userId", authMiddleware, projectController.getProjectByUser);
router.get('/:id/progress', authMiddleware, projectController.getProjectProgress);

module.exports = router;