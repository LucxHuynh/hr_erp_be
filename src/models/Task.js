const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Project = require('./Project');
const User = require('./User');
const crypto = require("crypto");

// Helper function to generate random string of length 16
const generateRandomId = () => {
  return crypto.randomBytes(8).toString("hex"); // 8 bytes = 16 hex characters
};

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      defaultValue: () => generateRandomId(),
    },
    project_id: {
      type: DataTypes.STRING(16),
      references: {
        model: Project,
        key: "id",
      },
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING(16),
      references: {
        model: User,
        key: "id",
      },
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("To Do", "In Progress", "Completed"),
      allowNull: false,
      defaultValue: "To Do",
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      allowNull: false,
      defaultValue: "Medium",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
  }
);

// **Thiết lập quan hệ**
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasMany(Task, { foreignKey: 'project_id' });

Task.belongsTo(User, { foreignKey: 'user_id', as: 'assignee' });
User.hasMany(Task, { foreignKey: 'user_id' });

module.exports = Task;