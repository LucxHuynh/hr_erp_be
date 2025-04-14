const projectMemberService = require('../../services/projectMemberService');

class ProjectMemberController {
    addProjectMember = async (req, res) => {
      try {
        const { project_id, user_id } = req.body;

        // Validate required fields
        if (!project_id || !user_id) {
          return res.status(400).json({
            message: "Validation failed",
            error: "Project ID and User ID are required",
          });
        }

        const result = await projectMemberService.addProjectMember(
          project_id,
          user_id
        );
        res.status(201).json(result);
      } catch (error) {
        res
          .status(400)
          .json({
            message: "Failed to add project member",
            error: error.message,
          });
      }
    };

    removeProjectMember = async (req, res) => {
      try {
        const { project_id, user_id } = req.body;

        // Validate required fields
        if (!project_id || !user_id) {
          return res.status(400).json({
            message: "Validation failed",
            error: "Project ID and User ID are required",
          });
        }

        const result = await projectMemberService.removeMember(
          project_id,
          user_id
        );
        res.status(200).json(result);
      } catch (error) {
        res
          .status(400)
          .json({
            message: "Failed to remove project member",
            error: error.message,
          });
      }
    };

    getProjectMembers = async (req, res) => {
        try {
            const { project_id } = req.params;
            const result = await projectMemberService.getProjectMembers(project_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get project members', error: error.message });
        }
    }

    getAllMembers = async (req, res) => {
        try {
            const result = await projectMemberService.getAllMember();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get all members', error: error.message });
        }
    }

    getProjectsByMember = async (req, res) => {
        try {
            const { user_id } = req.params;
            const result = await projectMemberService.getProjectsByMember(user_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get projects by member', error: error.message });
        }
    }
}

module.exports = ProjectMemberController;