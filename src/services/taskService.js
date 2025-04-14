const { currentLineHeight } = require("pdfkit");
const Task = require("../models/Task");
const notificationService = require("./notificationService");

const TaskService = {
  createTask: async (taskData) => {
    const task = await Task.create(taskData);
    return task;
  },

  assignTask: async (taskId, userId) => {
    const task = await Task.findByPk(taskId, { where: { isDelete: false } });
    if (!task) {
      throw new Error("Task not found");
    }
    task.user_id = userId;
    await task.save();

    // Send notification
    const message = `You have been assigned a new task: ${task.description}`;
    const link = `/tasks/${taskId}`;
    await notificationService.createNotification(
      userId,
      "TASK_UPDATED",
      message,
      link
    );
    console.log("send notification");
    return task;
  },

  updateTaskStatus: async (taskId, status) => {
    const task = await Task.findByPk(taskId, { where: { isDelete: false } });
    if (!task) {
      throw new Error("Task not found");
    }
    task.status = status;
    await task.save();
    return task;
  },

  updateTaskPriority: async (taskId, priority) => {
    const task = await Task.findByPk(taskId, { where: { isDelete: false } });
    if (!task) {
      throw new Error("Task not found");
    }
    task.priority = priority;
    await task.save();

    // Send notification
    const message = `The priority of your task "${task.description}" has been changed to ${priority}`;
    const link = `/tasks/${taskId}`;
    await notificationService.createNotification(
      task.user_id,
      "TASK_UPDATED",
      message,
      link
    );

    return task;
  },

  getAllTasks: async () => {
    const tasks = await Task.findAll({ where: { isDelete: false } });
    return tasks;
  },

  getTaskById: async (taskId) => {
    const task = await Task.findOne({ where: { id: taskId, isDelete: false } });
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  },

  getTasksByProject: async (projectId) => {
    const tasks = await Task.findAll({
      where: { project_id: projectId, isDelete: false },
    });
    return tasks;
  },

  getTasksByUser: async (userId) => {
    const tasks = await Task.findAll({
      where: { user_id: userId, isDelete: false },
    });
    return tasks;
  },

  deleteTask: async (taskId) => {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    task.isDelete = true;
    await task.save();

    // Notify assigned user if task was assigned
    if (task.user_id) {
      await notificationService.createNotification(
        task.user_id,
        "TASK_DELETED",
        `Task "${task.description}" has been deleted`,
        "/tasks"
      );
    }
  },
};

module.exports = TaskService;
