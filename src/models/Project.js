const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const crypto = require("crypto");

// Helper function to generate random string of length 16
const generateRandomId = () => {
  return crypto.randomBytes(8).toString("hex"); // 8 bytes = 16 hex characters
};

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      defaultValue: () => generateRandomId(),
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    create_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    manager_id: {
      type: DataTypes.STRING(16),
      references: {
        model: User,
        key: "id",
      },
    },
    isDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "projects",
    timestamps: true,
  }
);

// **Tạo quan hệ giữa Project và User**
Project.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
User.hasMany(Project, { foreignKey: 'manager_id' });

module.exports = Project;
