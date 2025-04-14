const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require("crypto");

// Helper function to generate random string of length 16
const generateRandomId = () => {
  return crypto.randomBytes(8).toString("hex"); // 8 bytes = 16 hex characters
};

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      defaultValue: () => generateRandomId(),
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    avatarURL: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
    },
    position: {
      type: DataTypes.STRING(100),
    },
    hire_date: {
      type: DataTypes.DATEONLY,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive", "Resigned"),
      defaultValue: "Active",
    },
    role: {
      type: DataTypes.ENUM("Admin", "Employee", "Manager", "Account"),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    isDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = User;