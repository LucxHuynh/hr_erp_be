const Project = require("../models/Project");
const Task = require("../models/Task");
const ProjectMember = require("../models/ProjectMember");
const { Op } = require("sequelize");
const projectMemberService = require("./projectMemberService");
const notificationService = require("./notificationService");

const ProjectService = {
  createProject: async (projectData) => {
    const project = await Project.create(projectData);
    // Add project manager as a member
    await projectMemberService.addProjectMember(project.id, project.manager_id);
    return project;
  },

  getAllProjects: async () => {
    const projects = await Project.findAll({
      where: {
        isDelete: false,
      },
    });
    return projects;
  },

  getProjectByUser: async (user_id) => {
    const projects = await Project.findAll({
      where: {
        isDelete: false,
      },
      include: [
        {
          model: Task,
          as: "tasks",
          where: { user_id },
        },
      ],
    });
    return projects;
  },

  getProjectById: async (id) => {
    const project = await Project.findOne({
      where: {
        id,
        isDelete: false,
      },
    });
    return project;
  },

  getProjectNameById: async (id) => {
    const project = await Project.findOne({
      where: {
        id,
        isDelete: false,
      },
      attributes: ["name"],
    });
    return project ? project.name : null;
  },

  getProjectByName: async (name) => {
    const projects = await Project.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`,
        },
        isDelete: false,
      },
    });
    return projects;
  },

  getProjectByManager: async (manager_id) => {
    const projects = await Project.findAll({
      where: {
        manager_id,
        isDelete: false,
      },
    });
    return projects;
  },

  getProjectProgress: async (id) => {
    const project = await Project.findOne({
      where: {
        id,
        isDelete: false,
      },
      include: [
        {
          model: Task,
          as: "tasks",
        },
      ],
    });
    if (!project) {
      throw new Error("Project not found");
    }
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const progress =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    return progress;
  },

  updateProject: async (id, projectData) => {
    const project = await Project.findOne({
      where: {
        id,
        isDelete: false,
      },
    });
    if (!project) {
      throw new Error("Project not found");
    }
    Object.assign(project, projectData);
    await project.save();
    return project;
  },

  deleteProject: async (id) => {
    const project = await Project.findByPk(id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Get all project members before deletion
    const projectMembers = await projectMemberService.getProjectMembers(id);

    // Mark project as deleted
    project.isDelete = true;
    await project.save();

    // Update all related tasks and project members
    await Promise.all([
      Task.update({ isDelete: true }, { where: { project_id: id } }),
      ProjectMember.update({ isDelete: true }, { where: { project_id: id } }),
    ]);

    // Notify all project members
    for (const member of projectMembers) {
      await notificationService.createNotification(
        member.user_id,
        "PROJECT_REMOVED",
        `Project "${project.name}" has been deleted`,
        "/projects"
      );
    }

    return null;
  },

  getMemberProjects: async (userId) => {
    const projects = await Project.findAll({
      include: [
        {
          model: require("../models/ProjectMember"),
          as: "projectMembers",
          where: { user_id: userId },
          required: true,
        },
      ],
      where: {
        isDelete: false,
      },
    });
    return projects;
  },
};

module.exports = ProjectService;