const ProjectMember = require("../models/ProjectMember");
const Project = require("../models/Project");
const Task = require("../models/Task");
const notificationService = require("./notificationService");

const ProjectMemberService = {
  addProjectMember: async (project_id, user_id) => {
    const member = await ProjectMember.create({ project_id, user_id });

    // Get project name directly from Project model
    const project = await Project.findOne({
      where: { id: project_id },
      attributes: ["name"],
    });

    const message = `You have been added to project "${
      project?.name || "Unknown"
    }"`;
    const link = `/projects/${project_id}`;
    await notificationService.createNotification(
      user_id,
      "PROJECT_ASSIGNED",
      message,
      link
    );

    return member;
  },

  getAllMember: async () => {
    const members = await ProjectMember.findAll();
    return members;
  },

  getProjectMembers: async (project_id) => {
    const members = await ProjectMember.findAll({ where: { project_id } });
    return members;
  },

  getProjectsByMember: async (user_id) => {
    const projectMembers = await ProjectMember.findAll({ where: { user_id } });

    // Get the project IDs
    const projectIds = projectMembers.map((member) => member.project_id);

    // Get complete project data for each project using Project model
    const projectPromises = projectIds.map((projectId) =>
      Project.findOne({ where: { id: projectId } })
    );

    const projects = await Promise.all(projectPromises);

    // Filter out any null values (in case a project was deleted)
    return projects.filter((project) => project !== null);
  },

  removeMember: async (project_id, user_id) => {
    const member = await ProjectMember.findOne({
      where: { project_id, user_id },
    });
    if (!member) {
      throw new Error("Project member not found");
    }

    // Get project name before removing member
    const project = await Project.findOne({
      where: { id: project_id },
      attributes: ["name"],
    });

    // Unassign all tasks assigned to this member in this project
    await Task.update({ user_id: null }, { where: { project_id, user_id } });

    await member.destroy();

    // Send notification
    const message = `You have been removed from project "${
      project?.name || "Unknown"
    }"`;
    const link = `/projects/${project_id}`;
    await notificationService.createNotification(
      user_id,
      "PROJECT_REMOVED",
      message,
      link
    );

    return member;
  },
};

module.exports = ProjectMemberService;
