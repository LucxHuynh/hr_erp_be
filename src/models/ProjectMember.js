const { DataTypes, Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const Project = require('./Project');
const User = require('./User');

const ProjectMember = sequelize.define(
  "ProjectMember",
  {
    project_id: {
      type: DataTypes.STRING(16),
      references: {
        model: Project,
        key: "id",
      },
      allowNull: false,
      primaryKey: true, // Set as part of composite primary key
    },
    user_id: {
      type: DataTypes.STRING(16),
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
      primaryKey: true, // Set as part of composite primary key
    },
    role: {
      type: DataTypes.ENUM("Manager", "Member"),
      defaultValue: "Member",
    },
    join_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    isDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "project_members",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["project_id", "user_id"],
      },
    ],
  }
);

// **Thiết lập quan hệ**
ProjectMember.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasMany(ProjectMember, { foreignKey: 'project_id' });

ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'member' });
User.hasMany(ProjectMember, { foreignKey: 'user_id' });

module.exports = ProjectMember;